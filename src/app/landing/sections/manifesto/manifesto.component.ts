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
import { gsap } from '../../../core/gsap';
import { MotionService } from '../../../core/motion.service';
import { splitWords } from '../../../shared/split-text';

/**
 * One statement, scrubbed word by word from 12% to full ink as the
 * reader scrolls through it. The section is intentionally empty of
 * anything else — the sentence is the design.
 */
@Component({
  selector: 'app-manifesto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section bg-base" aria-label="De ce există SkinAlert">
      <div class="container-edit">
        <p
          #statement
          class="headline mx-auto max-w-4xl text-[clamp(1.9rem,4.5vw,3.5rem)] text-ink"
        >
          Depistat la timp, melanomul se tratează în peste 90% din cazuri. Diferența o face
          momentul în care ajungi la medic. SkinAlert există ca acel moment să vină
          mai devreme.
        </p>
      </div>
    </section>
  `,
})
export class ManifestoComponent implements AfterViewInit, OnDestroy {
  private readonly zone = inject(NgZone);
  private readonly motion = inject(MotionService);

  private readonly statement = viewChild.required<ElementRef<HTMLElement>>('statement');

  private tween?: gsap.core.Tween;

  ngAfterViewInit(): void {
    if (this.motion.reducedMotion()) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      const host = this.statement().nativeElement;
      const words = splitWords(host, 'scrub-word');

      this.tween = gsap.to(words, {
        opacity: 1,
        ease: 'none',
        stagger: 0.6,
        scrollTrigger: {
          trigger: host,
          start: 'top 78%',
          end: 'bottom 45%',
          scrub: 0.4,
        },
      });
    });
  }

  ngOnDestroy(): void {
    this.tween?.scrollTrigger?.kill();
    this.tween?.kill();
  }
}
