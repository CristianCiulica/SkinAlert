import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export interface NeuralOrbOptions {
  /** Skip continuous rotation & pulsing (prefers-reduced-motion). */
  reducedMotion: boolean;
}

/**
 * SkinAlert hero object: a physically-based glass orb enclosing a
 * procedurally generated neural lattice — nodes on a fibonacci sphere,
 * connected by proximity, pulsing softly like signal activity.
 *
 * Deliberately framework-agnostic: the Angular component owns the
 * lifecycle and feeds it pointer/scroll/resize input.
 */
export class NeuralOrbScene {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;
  private readonly composer: EffectComposer;
  private readonly bloom: UnrealBloomPass;
  private readonly clock = new THREE.Clock();

  private readonly group = new THREE.Group();
  private readonly shell: THREE.Mesh;
  private readonly nodes: THREE.Points;
  private readonly links: THREE.LineSegments;
  private readonly core: THREE.Mesh;
  private readonly keyLight: THREE.PointLight;
  private readonly rimLight: THREE.PointLight;

  private readonly nodePositions: Float32Array;
  private readonly nodePhases: Float32Array;

  /** Pointer target in [-1, 1], eased every frame. */
  private pointer = new THREE.Vector2();
  private pointerEased = new THREE.Vector2();

  /** Scroll progress [0, 1] set from GSAP ScrollTrigger. */
  scrollProgress = 0;

  private frameId = 0;
  private disposed = false;
  private readonly pmremEnv: THREE.Texture;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly opts: NeuralOrbOptions,
  ) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
    this.camera.position.set(0, 0, 9);

    // HDR-quality studio environment without shipping an HDRI file.
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.pmremEnv = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = this.pmremEnv;
    pmrem.dispose();

    // --- Lights (env does most of the work; these add color intent) ---
    this.keyLight = new THREE.PointLight(0x4fd1c5, 30, 30);
    this.keyLight.position.set(4, 3, 5);
    this.rimLight = new THREE.PointLight(0x60a5fa, 22, 30);
    this.rimLight.position.set(-5, -2, -4);
    this.scene.add(this.keyLight, this.rimLight, new THREE.AmbientLight(0x0b0b0d, 2));

    // --- Glass shell: thin transparent bubble so the lattice stays visible.
    // (True transmission scatters the bright env into an opaque milky ball.)
    this.shell = new THREE.Mesh(
      new THREE.SphereGeometry(2, 96, 96),
      new THREE.MeshPhysicalMaterial({
        transparent: true,
        opacity: 0.1,
        roughness: 0.05,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        envMapIntensity: 0.9,
        iridescence: 0.35,
        iridescenceIOR: 1.3,
        color: 0x9ff5ec,
        depthWrite: false,
      }),
    );
    this.group.add(this.shell);

    // --- Neural lattice: fibonacci-sphere nodes + proximity links ---
    const NODE_COUNT = 220;
    this.nodePositions = new Float32Array(NODE_COUNT * 3);
    this.nodePhases = new Float32Array(NODE_COUNT);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < NODE_COUNT; i++) {
      const y = 1 - (i / (NODE_COUNT - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      // Two shells of nodes for layered depth.
      const radius = i % 3 === 0 ? 1.05 : 1.55;
      this.nodePositions[i * 3] = Math.cos(theta) * r * radius;
      this.nodePositions[i * 3 + 1] = y * radius;
      this.nodePositions[i * 3 + 2] = Math.sin(theta) * r * radius;
      this.nodePhases[i] = Math.random() * Math.PI * 2;
    }

    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(this.nodePositions.slice(), 3));
    this.nodes = new THREE.Points(
      nodeGeo,
      new THREE.PointsMaterial({
        color: 0x9ff5ec,
        size: 0.045,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    );
    this.group.add(this.nodes);

    const linkVerts: number[] = [];
    const maxDist = 0.72;
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const dx = this.nodePositions[i * 3] - this.nodePositions[j * 3];
        const dy = this.nodePositions[i * 3 + 1] - this.nodePositions[j * 3 + 1];
        const dz = this.nodePositions[i * 3 + 2] - this.nodePositions[j * 3 + 2];
        if (Math.sqrt(dx * dx + dy * dy + dz * dz) < maxDist) {
          linkVerts.push(
            this.nodePositions[i * 3],
            this.nodePositions[i * 3 + 1],
            this.nodePositions[i * 3 + 2],
            this.nodePositions[j * 3],
            this.nodePositions[j * 3 + 1],
            this.nodePositions[j * 3 + 2],
          );
        }
      }
    }
    const linkGeo = new THREE.BufferGeometry();
    linkGeo.setAttribute('position', new THREE.Float32BufferAttribute(linkVerts, 3));
    this.links = new THREE.LineSegments(
      linkGeo,
      new THREE.LineBasicMaterial({
        color: 0x4fd1c5,
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    this.group.add(this.links);

    // --- Glowing nucleus ---
    this.core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.42, 3),
      new THREE.MeshStandardMaterial({
        color: 0x4fd1c5,
        emissive: 0x2dd4bf,
        emissiveIntensity: 1.5,
        roughness: 0.3,
        metalness: 0.1,
      }),
    );
    this.group.add(this.core);

    this.scene.add(this.group);

    // --- Postprocessing: render + bloom + output ---
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.45, 0.8, 0.88);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    this.resize();
    this.frameId = requestAnimationFrame(this.loop);
  }

  setPointer(nx: number, ny: number): void {
    this.pointer.set(nx, ny);
  }

  resize(): void {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const { clientWidth: w, clientHeight: h } = parent;
    if (w === 0 || h === 0) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h);
  }

  private loop = (): void => {
    if (this.disposed) return;
    this.frameId = requestAnimationFrame(this.loop);

    const t = this.clock.getElapsedTime();
    const p = this.scrollProgress;

    // Ease pointer for a weighty, premium feel.
    this.pointerEased.lerp(this.pointer, 0.045);

    if (!this.opts.reducedMotion) {
      this.group.rotation.y = t * 0.12 + p * Math.PI * 1.2;
      this.group.rotation.x = Math.sin(t * 0.08) * 0.08 + p * 0.5;

      // Node pulse — subtle radial breathing per node.
      const posAttr = this.nodes.geometry.getAttribute('position') as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < this.nodePhases.length; i++) {
        const s = 1 + Math.sin(t * 1.4 + this.nodePhases[i]) * 0.035;
        arr[i * 3] = this.nodePositions[i * 3] * s;
        arr[i * 3 + 1] = this.nodePositions[i * 3 + 1] * s;
        arr[i * 3 + 2] = this.nodePositions[i * 3 + 2] * s;
      }
      posAttr.needsUpdate = true;

      const coreMat = this.core.material as THREE.MeshStandardMaterial;
      coreMat.emissiveIntensity = 1.4 + Math.sin(t * 1.8) * 0.35;
      this.core.rotation.y = -t * 0.25;
    }

    // Mouse parallax on camera, always gentle.
    this.camera.position.x += (this.pointerEased.x * 0.7 - this.camera.position.x) * 0.06;
    this.camera.position.y += (-this.pointerEased.y * 0.45 - this.camera.position.y) * 0.06;

    // Scroll choreography: camera pulls back & drifts, lattice opens,
    // lighting shifts from teal toward clinical blue.
    this.camera.position.z = 9 + p * 2.2;
    this.camera.lookAt(0, p * -0.6, 0);

    const spread = 1 + p * 0.35;
    this.nodes.scale.setScalar(spread);
    this.links.scale.setScalar(spread);
    (this.links.material as THREE.LineBasicMaterial).opacity = 0.22 * (1 - p * 0.5);

    this.keyLight.color.lerpColors(
      new THREE.Color(0x4fd1c5),
      new THREE.Color(0x60a5fa),
      p,
    );
    this.bloom.strength = 0.55 + p * 0.25;

    this.composer.render();
  };

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.LineSegments) {
        obj.geometry.dispose();
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => m.dispose());
      }
    });
    this.pmremEnv.dispose();
    this.composer.dispose();
    this.renderer.dispose();
  }
}
