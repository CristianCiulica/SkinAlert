import { Injectable, isDevMode } from '@angular/core';

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

@Injectable({ providedIn: 'root' })
export class AnalyzerService {
  // Când rulezi "ng serve", folosește localhost. Pe Vercel, va folosi link-ul de Render.
  private readonly apiUrl = isDevMode() 
    ? 'http://localhost:8000/api/analyze' 
    : 'https://INLOCUIESTE-CU-LINKUL-DE-LA-RENDER.onrender.com/api/analyze';


  async analyze(file: File): Promise<AnalysisResult> {
    const form = new FormData();
    form.append('image', file);
    const resp = await fetch(this.apiUrl, { method: 'POST', body: form });
    if (!resp.ok) {
      const detail = await resp.json().catch(() => ({}));
      throw new Error(detail?.detail ?? `Eroare server (${resp.status})`);
    }
    return resp.json();
  }
}
