# SkinAlert — Landing Page

**Early Detection. Smarter Decisions.**

Premium marketing site for SkinAlert, an AI-powered skin lesion analysis platform.
Dark, cinematic, Apple-keynote-style scroll experience built with Angular.

> SkinAlert supports early awareness. It does not diagnose cancer — always
> consult a qualified dermatologist.

## Stack

- **Angular 20** — standalone components, signals, zone-coalesced change detection, `@defer`
- **TailwindCSS 4** — design tokens via `@theme` in [src/styles.css](src/styles.css)
- **Three.js** — custom "neural orb" hero scene (PBR glass shell, procedural neural lattice, RoomEnvironment lighting, UnrealBloom postprocessing)
- **GSAP + ScrollTrigger** — scroll choreography, pinned sections, counters, reveals
- **Lenis** — smooth scrolling, driven by the GSAP ticker (single rAF loop)

## Run

```bash
npm install
npm start        # http://localhost:4200
npm run build    # production build → dist/skinalert
```

## Architecture

```
src/app/
├── core/
│   ├── gsap.ts                  # single plugin registration + shared eases
│   ├── motion.service.ts        # prefers-reduced-motion signal
│   ├── scroll.service.ts        # Lenis ↔ ScrollTrigger sync, scrollY/direction signals
│   └── three/
│       └── neural-orb.scene.ts  # framework-agnostic Three.js scene class
├── shared/
│   ├── directives/
│   │   ├── reveal.directive.ts  # scroll reveals: fade / blur / word & letter stagger / scale
│   │   ├── tilt.directive.ts    # pointer-driven 3D card tilt (gsap.quickTo)
│   │   └── ripple.directive.ts  # click ripple for buttons
│   └── pipes/
│       └── safe-html.pipe.ts    # trusts static inline SVG icons only
└── landing/
    ├── landing.component.ts     # page shell, section order, skip link
    └── sections/                # navbar, hero (+3D scene), stats, timeline,
                                 # technology, showcase, feature-grid, comparison,
                                 # testimonials, disclaimer, faq, cta, footer
```

### Design decisions

- **Performance-first 3D** — the Three.js scene is loaded with `@defer (on idle)`,
  keeping it (567 kB raw) out of the initial bundle (~123 kB transfer). The scene
  runs outside Angular's zone, caps `devicePixelRatio` at 2, and disposes all
  GPU resources on destroy.
- **One rAF loop** — Lenis is ticked by GSAP's ticker; ScrollTrigger updates on
  Lenis scroll events. No competing animation loops.
- **Reduced motion** — `MotionService` gates Lenis, GSAP reveals, orb autoplay,
  tilt, ripple and CSS animations behind `prefers-reduced-motion`.
- **Accessibility** — semantic landmarks, skip link, `aria-current`/`aria-expanded`
  state, `aria-label` preserved on word-split headlines, keyboard-reachable
  navigation and FAQ.

### Scroll choreography

| Section    | Behavior |
|------------|----------|
| Hero orb   | Camera pull-back, lattice spread, teal→blue light shift scrubbed over the first two viewports |
| Navbar     | Glass blur after 24 px, hides scrolling down, returns scrolling up |
| Stats      | Counter tweens fire once on entry |
| Timeline   | Pinned; vertical scroll scrubs the horizontal step track (desktop) |
| Showcase   | Pinned phone; scroll progress selects one of seven app screens |
