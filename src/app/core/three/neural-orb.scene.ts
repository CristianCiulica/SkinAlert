import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export interface NeuralOrbOptions {
  /** Skip continuous rotation & pulsing (prefers-reduced-motion). */
  reducedMotion: boolean;
}

/**
 * SkinAlert hero object, Apple-keynote edition: a translucent white
 * glass sphere enclosing a delicate blue neural lattice — nodes on a
 * fibonacci sphere, connected by proximity, breathing softly.
 *
 * Rendered directly (no bloom pass): postprocessing composites over a
 * black backbuffer, which would break the transparent canvas on a
 * white page. The soft studio look comes from the PMREM environment
 * and gentle key/fill lights instead.
 *
 * Deliberately framework-agnostic: the Angular component owns the
 * lifecycle and feeds it pointer/scroll/resize input.
 */
export class NeuralOrbScene {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;
  private readonly clock = new THREE.Clock();

  private readonly group = new THREE.Group();
  private readonly shell: THREE.Mesh;
  private readonly nodes: THREE.Points;
  private readonly links: THREE.LineSegments;
  private readonly core: THREE.Mesh;
  private readonly keyLight: THREE.DirectionalLight;
  private readonly fillLight: THREE.DirectionalLight;

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
    this.renderer.toneMappingExposure = 1.1;

    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
    this.camera.position.set(0, 0, 9);

    // Soft studio reflections without shipping an HDRI file.
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.pmremEnv = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = this.pmremEnv;
    pmrem.dispose();

    // --- Keynote lighting: white key from above, cool fill, airy ambient ---
    this.keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    this.keyLight.position.set(3, 5, 4);
    this.fillLight = new THREE.DirectionalLight(0xbfe3ff, 1.1);
    this.fillLight.position.set(-4, -2, 3);
    this.scene.add(this.keyLight, this.fillLight, new THREE.AmbientLight(0xffffff, 0.6));

    // --- Translucent white glass shell ---
    this.shell = new THREE.Mesh(
      new THREE.SphereGeometry(2, 96, 96),
      new THREE.MeshPhysicalMaterial({
        transparent: true,
        opacity: 0.22,
        roughness: 0.12,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.18,
        envMapIntensity: 1.1,
        iridescence: 0.08,
        iridescenceIOR: 1.2,
        color: 0xf4f9ff,
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

    // Additive blending washes out over a white page — use normal
    // blending with saturated Apple blues so the lattice reads crisply.
    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(this.nodePositions.slice(), 3));
    this.nodes = new THREE.Points(
      nodeGeo,
      new THREE.PointsMaterial({
        color: 0x007aff,
        size: 0.05,
        transparent: true,
        opacity: 0.85,
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
        color: 0x5ac8fa,
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
      }),
    );
    this.group.add(this.links);

    // --- Pearl nucleus: white ceramic with the faintest cool sheen ---
    this.core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.42, 3),
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.18,
        metalness: 0.05,
        clearcoat: 1,
        clearcoatRoughness: 0.2,
        envMapIntensity: 1.2,
        emissive: 0xcfe8ff,
        emissiveIntensity: 0.25,
      }),
    );
    this.group.add(this.core);

    this.scene.add(this.group);

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
  }

  private loop = (): void => {
    if (this.disposed) return;
    this.frameId = requestAnimationFrame(this.loop);

    const t = this.clock.getElapsedTime();
    const p = this.scrollProgress;

    // Ease pointer for a weighty, premium feel.
    this.pointerEased.lerp(this.pointer, 0.045);

    if (!this.opts.reducedMotion) {
      this.group.rotation.y = t * 0.1 + p * Math.PI * 0.9;
      this.group.rotation.x = Math.sin(t * 0.08) * 0.06 + p * 0.35;

      // Node pulse — subtle radial breathing per node.
      const posAttr = this.nodes.geometry.getAttribute('position') as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < this.nodePhases.length; i++) {
        const s = 1 + Math.sin(t * 1.2 + this.nodePhases[i]) * 0.03;
        arr[i * 3] = this.nodePositions[i * 3] * s;
        arr[i * 3 + 1] = this.nodePositions[i * 3 + 1] * s;
        arr[i * 3 + 2] = this.nodePositions[i * 3 + 2] * s;
      }
      posAttr.needsUpdate = true;

      const coreMat = this.core.material as THREE.MeshPhysicalMaterial;
      coreMat.emissiveIntensity = 0.22 + Math.sin(t * 1.6) * 0.08;
      this.core.rotation.y = -t * 0.2;
    }

    // Mouse parallax on camera, always gentle.
    this.camera.position.x += (this.pointerEased.x * 0.55 - this.camera.position.x) * 0.06;
    this.camera.position.y += (-this.pointerEased.y * 0.35 - this.camera.position.y) * 0.06;

    // Scroll choreography: camera pulls back & drifts, lattice opens,
    // light cools from warm white toward a soft sky blue.
    this.camera.position.z = 9 + p * 2;
    this.camera.lookAt(0, p * -0.5, 0);

    const spread = 1 + p * 0.3;
    this.nodes.scale.setScalar(spread);
    this.links.scale.setScalar(spread);
    (this.links.material as THREE.LineBasicMaterial).opacity = 0.4 * (1 - p * 0.45);

    this.keyLight.color.lerpColors(
      new THREE.Color(0xffffff),
      new THREE.Color(0xdcefff),
      p,
    );

    this.renderer.render(this.scene, this.camera);
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
    this.renderer.dispose();
  }
}
