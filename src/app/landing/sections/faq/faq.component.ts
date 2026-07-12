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
    <section id="faq" class="section bg-surface" aria-labelledby="faq-heading">
      <div class="mx-auto max-w-3xl px-6">
        <p appReveal mode="fade" class="section-label">Întrebări Frecvente</p>
        <h2 id="faq-heading" appReveal mode="words" [stagger]="0.05" class="mt-6 text-4xl font-bold tracking-tighter text-black sm:text-5xl">
          Răspunsuri clare. Fără ambiguități.
        </h2>

        <div class="mt-12 space-y-3">
          @for (item of items; track item.question; let i = $index) {
            <div appReveal mode="fade" [delay]="i * 0.06" class="card overflow-hidden rounded-2xl transition-colors duration-300" [class.border-black]="open() === i">
              <button
                type="button"
                class="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-bold transition-colors hover:text-black/70 text-black"
                [attr.aria-expanded]="open() === i"
                [attr.aria-controls]="'faq-panel-' + i"
                (click)="toggle(i)"
              >
                {{ item.question }}
                <svg
                  viewBox="0 0 24 24"
                  class="size-5 shrink-0 text-black transition-transform duration-500"
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
                  <p class="px-6 pb-6 leading-relaxed font-medium text-black/60">{{ item.answer }}</p>
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
      question: 'Oferă SkinAlert un diagnostic medical?',
      answer: 'Nu. SkinAlert estimează un nivel de risc din analizarea imaginilor cu rolul de a crește gradul de conștientizare. Doar un medic dermatolog calificat poate stabili un diagnostic, de obicei prin dermatoscopie și biopsie, dacă este cazul.',
    },
    {
      question: 'Cât de precisă este inteligența artificială?',
      answer: 'Modelele noastre ating o acuratețe de până la 98% pe seturile de date clinice. În lumea reală, precizia depinde de calitatea fotografiei și tipul leziunii, motiv pentru care orice rezultat suspect îndrumă către o vizită la specialist.',
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
