import { Injectable, signal } from '@angular/core';
import type * as Ort from 'onnxruntime-web';

export interface AnalysisOk {
  status: 'ok';
  probability_malignant: number;
  label: 'benign' | 'suspect';
  confidence: number;
  threshold: number;
  quality_metrics: Record<string, number>;
  recommendation: string;
  disclaimer: string;
}

export interface AnalysisLowQuality {
  status: 'low_quality';
  quality_issues: string[];
  quality_metrics: Record<string, number>;
  message: string;
  disclaimer: string;
}

export type AnalysisResult = AnalysisOk | AnalysisLowQuality;

/** 'downloading' = se aduc modelul + runtime (o singură dată), 'running' = analiză. */
export type AnalyzerPhase = 'idle' | 'downloading' | 'running';

// --- Constante replicate 1:1 din ml/ (config.json, quality_gate.py, server.py) ---
const IMG_SIZE = 300;
const MAX_SIZE = 384;
const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];
const TEMPERATURE = 0.7873;
const THRESHOLD = 0.23;
// quality_gate.py
const BLUR_MIN = 15.0;
const DARK_MIN = 55.0;
const BRIGHT_MAX = 242.0;
const CONTRAST_MIN = 8.0;

const DISCLAIMER = 'Acest rezultat este orientativ și NU constituie un diagnostic medical.';

/**
 * Inferență 100% în browser — imaginea nu părăsește niciodată dispozitivul.
 * Portează pipeline-ul din ml/ (OpenCV.js pentru preprocesare + ONNX Runtime
 * Web pentru model). Totul e încărcat leneș, la prima analiză.
 */
@Injectable({ providedIn: 'root' })
export class AnalyzerService {
  readonly phase = signal<AnalyzerPhase>('idle');

  private ort?: typeof Ort;
  /** Ensemble complet, ca pe serverul original: 2 modele (fp16). */
  private sessions: Ort.InferenceSession[] = [];
  // OpenCV.js nu are tipuri utile; îl tratăm ca `any`.
  private cv: any;
  private readyPromise?: Promise<void>;

  async analyze(file: File): Promise<AnalysisResult> {
    await this.ensureReady();
    this.phase.set('running');
    try {
      const bitmap = await createImageBitmap(file);
      try {
        const quality = this.qualityGate(bitmap);
        if (!quality.ok) {
          return {
            status: 'low_quality',
            quality_issues: quality.issues,
            quality_metrics: quality.metrics,
            message: 'Imaginea nu e suficient de bună pentru o analiză fiabilă.',
            disclaimer: DISCLAIMER,
          };
        }

        const input = this.preprocess(bitmap);
        const logit = await this.infer(input);
        const prob = sigmoid(logit / TEMPERATURE);
        const suspect = prob >= THRESHOLD;

        return {
          status: 'ok',
          probability_malignant: round(prob, 4),
          label: suspect ? 'suspect' : 'benign',
          confidence: round(suspect ? prob : 1 - prob, 4),
          threshold: round(THRESHOLD, 4),
          quality_metrics: quality.metrics,
          recommendation: suspect
            ? 'Leziunea prezintă caracteristici care justifică un consult dermatologic. Programează o evaluare de specialitate.'
            : 'Leziunea pare benignă. Continuă monitorizarea periodică și consultă un medic dacă observi modificări.',
          disclaimer: DISCLAIMER,
        };
      } finally {
        bitmap.close();
      }
    } finally {
      this.phase.set('idle');
    }
  }

  /** Încarcă (o singură dată) OpenCV.js, ONNX Runtime Web și ensemble-ul de modele. */
  private ensureReady(): Promise<void> {
    if (this.readyPromise) return this.readyPromise;
    this.phase.set('downloading');
    this.readyPromise = (async () => {
      // Buildul "wasm" (nu cel default cu WebGPU/jsep) — folosește fișierele
      // ort-wasm-simd-threaded.{wasm,mjs} pe care le auto-hostăm în /ort/.
      const [ort, cv] = await Promise.all([
        import('onnxruntime-web/wasm') as unknown as Promise<typeof Ort>,
        loadOpenCv(),
      ]);
      this.ort = ort;
      this.cv = cv;

      ort.env.wasm.numThreads = 1; // fără SharedArrayBuffer => fără headere COOP/COEP
      ort.env.wasm.wasmPaths = new URL('ort/', document.baseURI).href;

      this.sessions = await Promise.all(
        [0, 1].map((i) =>
          ort.InferenceSession.create(
            new URL(`models/skin-model-${i}.fp16.onnx`, document.baseURI).href,
            { executionProviders: ['wasm'], graphOptimizationLevel: 'all' },
          ),
        ),
      );
    })();
    return this.readyPromise;
  }

  // ---------- Quality gate (quality_gate.py) ----------
  private qualityGate(bitmap: ImageBitmap): {
    ok: boolean;
    issues: string[];
    metrics: Record<string, number>;
  } {
    const cv = this.cv;
    const rgba = cv.matFromImageData(drawToImageData(bitmap, IMG_SIZE, IMG_SIZE));
    const gray = new cv.Mat();
    const lap = new cv.Mat();
    const m = new cv.Mat();
    const s = new cv.Mat();
    try {
      cv.cvtColor(rgba, gray, cv.COLOR_RGBA2GRAY);
      cv.Laplacian(gray, lap, cv.CV_64F);
      cv.meanStdDev(lap, m, s);
      const blur = Math.pow(s.doubleAt(0, 0), 2);
      cv.meanStdDev(gray, m, s);
      const brightness = m.doubleAt(0, 0);
      const contrast = s.doubleAt(0, 0);

      const issues: string[] = [];
      if (blur < BLUR_MIN)
        issues.push('Poza pare neclară. Ține telefonul stabil și focalizează pe aluniță.');
      if (brightness < DARK_MIN)
        issues.push('Poza e prea întunecată. Mută-te într-un loc cu mai multă lumină.');
      if (brightness > BRIGHT_MAX)
        issues.push('Poza e supraexpusă (prea mult blitz/reflexie). Evită lumina directă.');
      if (contrast < CONTRAST_MIN)
        issues.push('Cadrul are prea puțin detaliu. Apropie-te și încadrează clar leziunea.');

      return {
        ok: issues.length === 0,
        issues,
        metrics: {
          blur: round(blur, 1),
          brightness: round(brightness, 1),
          contrast: round(contrast, 1),
        },
      };
    } finally {
      rgba.delete();
      gray.delete();
      lap.delete();
      m.delete();
      s.delete();
    }
  }

  // ---------- Preprocess (preprocess.py: resize -> hair removal -> shades of gray) ----------
  private preprocess(bitmap: ImageBitmap): Float32Array {
    const cv = this.cv;
    let w = bitmap.width;
    let h = bitmap.height;
    if (Math.max(w, h) > MAX_SIZE) {
      const scale = MAX_SIZE / Math.max(w, h);
      w = Math.round(w * scale);
      h = Math.round(h * scale);
    }

    // Downscale la ≤384 pe imaginea full-res cu INTER_AREA (antialiasing,
    // mai apropiat de PIL decât redimensionarea din canvas).
    const full = cv.matFromImageData(drawToImageData(bitmap, bitmap.width, bitmap.height));
    const rgba = new cv.Mat();
    if (w !== bitmap.width || h !== bitmap.height) {
      cv.resize(full, rgba, new cv.Size(w, h), 0, 0, cv.INTER_AREA);
      full.delete();
    } else {
      full.copyTo(rgba);
      full.delete();
    }
    const rgb = new cv.Mat();
    const resized = new cv.Mat();
    try {
      cv.cvtColor(rgba, rgb, cv.COLOR_RGBA2RGB);
      this.removeHair(rgb);
      this.shadesOfGray(rgb);
      cv.resize(rgb, resized, new cv.Size(IMG_SIZE, IMG_SIZE), 0, 0, cv.INTER_LINEAR);

      const px: Uint8Array = resized.data;
      const plane = IMG_SIZE * IMG_SIZE;
      const out = new Float32Array(3 * plane);
      for (let i = 0, p = 0; p < plane; p++, i += 3) {
        out[p] = (px[i] / 255 - MEAN[0]) / STD[0];
        out[plane + p] = (px[i + 1] / 255 - MEAN[1]) / STD[1];
        out[2 * plane + p] = (px[i + 2] / 255 - MEAN[2]) / STD[2];
      }
      return out;
    } finally {
      rgba.delete();
      rgb.delete();
      resized.delete();
    }
  }

  private removeHair(rgb: any): void {
    const cv = this.cv;
    const gray = new cv.Mat();
    const blackhat = new cv.Mat();
    const mask = new cv.Mat();
    const kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(17, 17));
    try {
      cv.cvtColor(rgb, gray, cv.COLOR_RGB2GRAY);
      cv.morphologyEx(gray, blackhat, cv.MORPH_BLACKHAT, kernel);
      cv.threshold(blackhat, mask, 10, 255, cv.THRESH_BINARY);
      if (cv.mean(mask)[0] < 1.0) return;

      const k3 = cv.Mat.ones(3, 3, cv.CV_8U);
      const dilated = new cv.Mat();
      const dst = new cv.Mat();
      try {
        cv.dilate(mask, dilated, k3);
        cv.inpaint(rgb, dilated, dst, 1, cv.INPAINT_TELEA);
        dst.copyTo(rgb);
      } finally {
        k3.delete();
        dilated.delete();
        dst.delete();
      }
    } finally {
      gray.delete();
      blackhat.delete();
      mask.delete();
      kernel.delete();
    }
  }

  private shadesOfGray(rgb: any, power = 6): void {
    const d: Uint8Array = rgb.data;
    const n = rgb.rows * rgb.cols;
    let s0 = 0;
    let s1 = 0;
    let s2 = 0;
    for (let i = 0; i < d.length; i += 3) {
      s0 += d[i] ** power;
      s1 += d[i + 1] ** power;
      s2 += d[i + 2] ** power;
    }
    const inv = 1 / power;
    let n0 = Math.pow(s0 / n, inv) || 1;
    let n1 = Math.pow(s1 / n, inv) || 1;
    let n2 = Math.pow(s2 / n, inv) || 1;
    const mean = (n0 + n1 + n2) / 3;
    const g0 = mean / n0;
    const g1 = mean / n1;
    const g2 = mean / n2;
    for (let i = 0; i < d.length; i += 3) {
      d[i] = clamp255(d[i] * g0);
      d[i + 1] = clamp255(d[i + 1] * g1);
      d[i + 2] = clamp255(d[i + 2] * g2);
    }
  }

  /**
   * Ensemble + TTA, identic cu serverul original (server.py):
   * 2 modele × 4 orientări (identitate, flip orizontal, flip vertical,
   * rotire 90°), logit-urile mediate. 8 treceri în total.
   */
  private async infer(input: Float32Array): Promise<number> {
    const ort = this.ort!;
    const variants = [input, flipW(input), flipH(input), rot90(input)];
    let total = 0;
    let n = 0;
    for (const session of this.sessions) {
      for (const v of variants) {
        const tensor = new ort.Tensor('float32', v, [1, 3, IMG_SIZE, IMG_SIZE]);
        const feeds: Record<string, Ort.Tensor> = { [session.inputNames[0]]: tensor };
        const output = await session.run(feeds);
        total += (output[session.outputNames[0]].data as Float32Array)[0];
        n++;
      }
    }
    return total / n;
  }
}

// ---------- Helpers ----------

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function round(x: number, dp: number): number {
  const f = 10 ** dp;
  return Math.round(x * f) / f;
}

function clamp255(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : Math.round(v);
}

// ---- TTA pe tensor CHW pătrat (S×S), replici ale torch.flip/rot90 ----

/** torch.flip(x, dims=[3]) — oglindire pe lățime. */
function flipW(src: Float32Array): Float32Array {
  const S = IMG_SIZE;
  const out = new Float32Array(src.length);
  for (let c = 0; c < 3; c++) {
    const base = c * S * S;
    for (let h = 0; h < S; h++)
      for (let w = 0; w < S; w++) out[base + h * S + w] = src[base + h * S + (S - 1 - w)];
  }
  return out;
}

/** torch.flip(x, dims=[2]) — oglindire pe înălțime. */
function flipH(src: Float32Array): Float32Array {
  const S = IMG_SIZE;
  const out = new Float32Array(src.length);
  for (let c = 0; c < 3; c++) {
    const base = c * S * S;
    for (let h = 0; h < S; h++)
      for (let w = 0; w < S; w++) out[base + h * S + w] = src[base + (S - 1 - h) * S + w];
  }
  return out;
}

/** torch.rot90(x, 1, dims=[2,3]) — out[i][j] = in[j][S-1-i]. */
function rot90(src: Float32Array): Float32Array {
  const S = IMG_SIZE;
  const out = new Float32Array(src.length);
  for (let c = 0; c < 3; c++) {
    const base = c * S * S;
    for (let i = 0; i < S; i++)
      for (let j = 0; j < S; j++) out[base + i * S + j] = src[base + j * S + (S - 1 - i)];
  }
  return out;
}

/** Desenează bitmap-ul într-un canvas de w×h și întoarce ImageData (RGBA). */
function drawToImageData(bitmap: ImageBitmap, w: number, h: number): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}

/**
 * Încarcă OpenCV.js printr-un <script> la runtime (self-hosted din /opencv/).
 * Nu-l importăm prin bundler fiindcă fișierul are ramuri Node (require fs/crypto)
 * pe care esbuild nu le poate rezolva. În browser acele ramuri nu rulează.
 */
function loadOpenCv(): Promise<any> {
  const w = window as any;
  if (w.__cvReady) return w.__cvReady;
  w.__cvReady = new Promise<any>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = new URL('opencv/opencv.js', document.baseURI).href;
    script.async = true;
    script.onerror = () => reject(new Error('Nu am putut încărca motorul de imagine.'));
    script.onload = async () => {
      let cv = w.cv;
      if (cv && typeof cv.then === 'function') cv = await cv;
      if (cv?.Mat) return resolve(cv);
      cv.onRuntimeInitialized = () => resolve(cv);
    };
    document.head.appendChild(script);
  });
  return w.__cvReady;
}
