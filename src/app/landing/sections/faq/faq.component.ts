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
    <section id="faq" class="section bg-base" aria-labelledby="faq-heading">
      <div class="mx-auto max-w-7xl px-6">
        <div class="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
          <div>
            <p appReveal mode="fade" class="section-label">06 — Întrebări frecvente</p>
            <h2 id="faq-heading" appReveal mode="words" [stagger]="0.05" class="mt-6 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Răspunsuri clare. Fără ambiguități.
            </h2>
          </div>

          <div class="mt-2">
            @for (item of items; track item.question; let i = $index) {
              <div appReveal mode="fade" [delay]="i * 0.05" class="border-t border-ink/10 last:border-b">
                <button
                  type="button"
                  class="flex w-full items-center justify-between gap-6 py-6 text-left text-lg font-semibold tracking-tight text-ink transition-colors hover:text-ink/60"
                  [attr.aria-expanded]="open() === i"
                  [attr.aria-controls]="'faq-panel-' + i"
                  (click)="toggle(i)"
                >
                  {{ item.question }}
                  <span
                    class="grid size-9 shrink-0 place-items-center rounded-full border border-ink/15 transition-all duration-500"
                    [class]="open() === i ? 'rotate-45 bg-accent border-accent text-white' : ''"
                    aria-hidden="true"
                  >
                    <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                  </span>
                </button>
                <div
                  [id]="'faq-panel-' + i"
                  role="region"
                  class="grid transition-[grid-template-rows] duration-500 ease-out"
                  [style.gridTemplateRows]="open() === i ? '1fr' : '0fr'"
                >
                  <div class="overflow-hidden">
                    <p class="max-w-2xl pb-7 leading-relaxed text-ink/60">{{ item.answer }}</p>
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
      question: 'Oferă SkinAlert un diagnostic medical?',
      answer: 'Nu. SkinAlert estimează un nivel de risc din analizarea imaginilor cu rolul de a crește gradul de conștientizare. Doar un medic dermatolog calificat poate stabili un diagnostic, de obicei prin dermatoscopie și biopsie, dacă este cazul.',
    },
    {
      question: 'Cât de precisă este inteligența artificială?',
      answer: 'Pe 2.359 de imagini de test nevăzute, modelul atinge un AUC de 0.968, cu sensibilitate de 94,2% și specificitate de 87,2%. Pe pozele făcute cu telefonul precizia scade (AUC 0.921) față de imaginile dermatoscopice — de aceea ghidul de captură contează, iar orice rezultat suspect te îndrumă către un specialist. Estimările pot greși în ambele direcții.',
    },
    {
      question: 'Ce se întâmplă cu fotografiile mele?',
      answer: 'Fotografiile sunt criptate la stocare și în tranzit. Nu sunt niciodată vândute sau distribuite către terți și pot fi șterse definitiv din sistem oricând dorești.',
    },
    {
      question: 'Ce tipuri de fotografii funcționează cel mai bine?',
      answer: 'Fotografii clare, bine iluminate, realizate cât mai aproape de leziune. Ghidul de captură inclus în aplicație te va ajuta să încadrezi imaginea corect pentru cele mai bune rezultate.',
    },
    {
      question: 'Este SkinAlert un dispozitiv medical aprobat?',
      answer: 'SkinAlert este un instrument de triaj și conștientizare. Nu este un dispozitiv de diagnostic omologat și nu trebuie utilizat ca substitut pentru sfatul unui medic profesionist.',
    },
  ];
}
