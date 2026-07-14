import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

interface FaqItem {
  question: string;
  answer: string;
}

/**
 * "05 — Întrebări" — accordion on hairlines. The plus marker is two CSS
 * lines that rotate into a cross; the panel animates via grid rows.
 */
@Component({
  selector: 'app-faq',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section id="faq" class="section bg-base" aria-labelledby="faq-heading">
      <div class="container-edit">
        <div class="rule flex items-baseline justify-between pt-6">
          <p appReveal mode="fade" class="index-label">05</p>
          <p appReveal mode="fade" class="index-label">Întrebări</p>
        </div>

        <div class="mt-16 grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          <h2
            id="faq-heading"
            appReveal
            mode="words"
            [stagger]="0.04"
            class="headline text-[clamp(2.25rem,4.5vw,3.5rem)] text-ink"
          >
            Înainte să încerci.
          </h2>

          <div>
            @for (item of items; track item.question; let i = $index) {
              <div appReveal mode="fade" [delay]="i * 0.05" class="rule last:border-b last:border-b-ink/12">
                <button
                  type="button"
                  class="group flex w-full items-center justify-between gap-6 py-7 text-left text-lg font-medium tracking-tight text-ink transition-colors hover:text-ink/60 sm:text-xl"
                  [attr.aria-expanded]="open() === i"
                  [attr.aria-controls]="'faq-panel-' + i"
                  (click)="toggle(i)"
                >
                  {{ item.question }}
                  <span class="relative block size-4 shrink-0" aria-hidden="true">
                    <span
                      class="absolute left-0 top-1/2 h-px w-full bg-current transition-transform duration-500"
                    ></span>
                    <span
                      class="absolute left-1/2 top-0 h-full w-px bg-current transition-transform duration-500"
                      [class]="open() === i ? 'scale-y-0' : ''"
                    ></span>
                  </span>
                </button>
                <div
                  [id]="'faq-panel-' + i"
                  role="region"
                  class="grid transition-[grid-template-rows] duration-500 ease-out"
                  [style.gridTemplateRows]="open() === i ? '1fr' : '0fr'"
                >
                  <div class="overflow-hidden">
                    <p class="max-w-2xl pb-8 leading-relaxed text-ink/55">{{ item.answer }}</p>
                  </div>
                </div>
              </div>
            }
          </div>
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
      question: 'Pune SkinAlert diagnostice?',
      answer:
        'Nu. SkinAlert estimează un nivel de risc ca să te ajute să decizi cât de repede mergi la medic. Doar un dermatolog poate stabili un diagnostic — de obicei prin dermatoscopie și, dacă e cazul, biopsie.',
    },
    {
      question: 'Cât de precisă este analiza?',
      answer:
        'Pe 2.359 de imagini de test nevăzute, modelul atinge un AUC de 0,968, cu o rată de detectare de 94,2%. Pe pozele făcute cu telefonul precizia scade față de imaginile de laborator — de aceea claritatea fotografiei contează, iar estimările pot greși în ambele direcții.',
    },
    {
      question: 'Ce se întâmplă cu fotografiile mele?',
      answer:
        'Fotografia e trimisă serverului de analiză, procesată în memorie și nu e salvată nicăieri. Nu există cont, deci nu păstrăm nimic despre tine după ce primești rezultatul.',
    },
    {
      question: 'Ce fel de fotografii funcționează cel mai bine?',
      answer:
        'Clare, bine luminate, făcute aproape de aluniță. Dacă imaginea nu e suficient de bună, aplicația îți spune și te lasă să reîncerci.',
    },
    {
      question: 'Este un dispozitiv medical omologat?',
      answer:
        'Nu. SkinAlert este un instrument de triaj și conștientizare, nu un substitut pentru consultul unui medic.',
    },
  ];
}
