import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

interface FaqItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faq',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section id="faq" class="section" aria-labelledby="faq-heading">
      <div class="mx-auto max-w-3xl px-6">
        <p appReveal mode="fade" class="section-label">FAQ</p>
        <h2 id="faq-heading" appReveal mode="words" [stagger]="0.05" class="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
          Questions, answered.
        </h2>

        <div class="mt-12 space-y-3">
          @for (item of items; track item.question; let i = $index) {
            <div appReveal mode="fade" [delay]="i * 0.06" class="glass overflow-hidden rounded-2xl transition-colors duration-300" [class.border-primary/25]="open() === i">
              <button
                type="button"
                class="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-medium transition-colors hover:text-primary"
                [attr.aria-expanded]="open() === i"
                [attr.aria-controls]="'faq-panel-' + i"
                (click)="toggle(i)"
              >
                {{ item.question }}
                <svg
                  viewBox="0 0 24 24"
                  class="size-5 shrink-0 text-primary transition-transform duration-500"
                  [class.rotate-45]="open() === i"
                  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"
                >
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </button>
              <div
                [id]="'faq-panel-' + i"
                role="region"
                class="grid transition-[grid-template-rows] duration-500 ease-out"
                [style.gridTemplateRows]="open() === i ? '1fr' : '0fr'"
              >
                <div class="overflow-hidden">
                  <p class="px-6 pb-6 leading-relaxed text-gray-400">{{ item.answer }}</p>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class FaqComponent {
  readonly open = signal<number>(0);

  toggle(i: number): void {
    this.open.set(this.open() === i ? -1 : i);
  }

  readonly items: FaqItem[] = [
    {
      question: 'Does SkinAlert diagnose skin cancer?',
      answer: 'No. SkinAlert estimates risk from image analysis to support early awareness. Only a qualified dermatologist can make a diagnosis, usually with dermoscopy and, when needed, a biopsy.',
    },
    {
      question: 'How accurate is the AI?',
      answer: 'Our models reach up to 98% accuracy on benchmark dermatology datasets. Real-world performance depends on photo quality and lesion type, which is why every result links to professional next steps.',
    },
    {
      question: 'What happens to my photos?',
      answer: 'Images are encrypted in transit and at rest, are never sold or shared, and can be permanently deleted by you at any time.',
    },
    {
      question: 'What kind of photos work best?',
      answer: 'Sharp, well-lit, close-up photos taken perpendicular to the skin. The in-app capture guide helps you frame the lesion correctly.',
    },
    {
      question: 'Is SkinAlert a medical device?',
      answer: 'SkinAlert is a wellness and awareness tool. It is not a certified diagnostic device and must never be used as a substitute for professional medical advice.',
    },
  ];
}
