import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
  viewChild,
} from '@angular/core';
import { ScrollTrigger } from '../../../core/gsap';
import { MotionService } from '../../../core/motion.service';
import { NeuralOrbScene } from '../../../core/three/neural-orb.scene';

/**
 * Hosts the Three.js neural-orb canvas. The canvas is fixed behind the
 * hero content and its choreography is driven by page scroll progress
 * across the hero + stats sections.
 */
@Component({
  selector: 'app-hero-scene',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #wrap class="absolute inset-0" aria-hidden="true">
      <canvas #canvas class="block h-full w-full"></canvas>
    </div>
  `,
  host: { class: 'absolute inset-0 block' },
})
export class HeroSceneComponent implements AfterViewInit, OnDestroy {
  private readonly zone = inject(NgZone);
  private readonly motion = inject(MotionService);

  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly wrapRef = viewChild.required<ElementRef<HTMLDivElement>>('wrap');

  private scene?: NeuralOrbScene;
  private resizeObserver?: ResizeObserver;
  private scrollTrigger?: ScrollTrigger;

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.scene = new NeuralOrbScene(this.canvasRef().nativeElement, {
        reducedMotion: this.motion.reducedMotion(),
      });

      this.resizeObserver = new ResizeObserver(() => this.scene?.resize());
      this.resizeObserver.observe(this.wrapRef().nativeElement);

      window.addEventListener('pointermove', this.onPointerMove, { passive: true });

      // Scroll choreography spans from page top through ~2 viewports.
      this.scrollTrigger = ScrollTrigger.create({
        start: 0,
        end: () => window.innerHeight * 2,
        scrub: true,
        onUpdate: (self) => {
          if (this.scene) {
            this.scene.scrollProgress = self.progress;
          }
        },
      });
    });
  }

  private onPointerMove = (e: PointerEvent): void => {
    this.scene?.setPointer(
      (e.clientX / window.innerWidth) * 2 - 1,
      (e.clientY / window.innerHeight) * 2 - 1,
    );
  };

  ngOnDestroy(): void {
    window.removeEventListener('pointermove', this.onPointerMove);
    this.resizeObserver?.disconnect();
    this.scrollTrigger?.kill();
    this.scene?.dispose();
  }
}
