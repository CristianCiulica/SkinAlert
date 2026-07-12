import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ScrollService } from '../../../core/scroll.service';
import { RippleDirective } from '../../../shared/directives/ripple.directive';

interface NavLink {
  label: string;
  anchor: string;
}

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RippleDirective],
  template: `
    <header
      class="fixed inset-x-0 top-6 z-50 flex justify-center transition-all duration-500 will-change-transform"
      [class.-translate-y-24]="hidden()"
      [class.translate-y-0]="!hidden()"
    >
      <nav
        class="glass flex items-center justify-between gap-8 rounded-full px-6 py-3 transition-all duration-500"
        aria-label="Main navigation"
      >
        <a
          href="#top"
          (click)="go($event, '#top')"
          class="group flex items-center gap-2 pl-2 text-xl font-bold tracking-tight text-black"
          aria-label="SkinAlert home"
        >
          SkinAlert
        </a>

        <ul class="hidden items-center gap-2 md:flex">
          @for (link of links; track link.anchor) {
            <li>
              <a
                [href]="link.anchor"
                (click)="go($event, link.anchor)"
                class="rounded-full px-4 py-2 text-sm font-medium text-black/70 transition-colors hover:bg-black/5 hover:text-black"
              >
                {{ link.label }}
              </a>
            </li>
          }
        </ul>

        <div class="flex items-center gap-2">
          <a
            href="#analyzer"
            (click)="go($event, '#analyzer')"
            appRipple
            class="btn-primary hidden rounded-full px-6 py-2 text-sm font-bold md:inline-flex"
          >
            Analizează
          </a>

          <button
            type="button"
            class="grid size-10 place-items-center rounded-full bg-black/5 text-black transition-colors hover:bg-black/10 md:hidden"
            (click)="menuOpen.set(!menuOpen())"
            [attr.aria-expanded]="menuOpen()"
            aria-controls="mobile-menu"
            aria-label="Toggle menu"
          >
            <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              @if (menuOpen()) {
                <path d="M6 6l12 12M18 6L6 18" />
              } @else {
                <path d="M4 7h16M4 12h16M4 17h16" />
              }
            </svg>
          </button>
        </div>
      </nav>

      @if (menuOpen()) {
        <div id="mobile-menu" class="glass absolute top-20 mx-4 w-[calc(100%-2rem)] rounded-3xl p-4 md:hidden">
          <ul class="flex flex-col gap-2">
            @for (link of links; track link.anchor) {
               <li>
                <a
                  [href]="link.anchor"
                  (click)="go($event, link.anchor)"
                  class="block rounded-2xl px-4 py-3 text-base font-medium text-black/80 transition-colors hover:bg-black/5 hover:text-black"
                >
                  {{ link.label }}
                </a>
              </li>
            }
            <li class="mt-2">
              <a
                href="#analyzer"
                (click)="go($event, '#analyzer')"
                appRipple
                class="btn-primary block rounded-2xl px-5 py-4 text-center text-base font-bold"
              >
                Analizează Acum
              </a>
            </li>
          </ul>
        </div>
      }
    </header>
  `,
})
export class NavbarComponent {
  private readonly scroll = inject(ScrollService);

  readonly links: NavLink[] = [
    { label: 'Platformă AI', anchor: '#analyzer' },
    { label: 'Funcționalități', anchor: '#features' },
  ];

  readonly menuOpen = signal(false);

  readonly scrolled = computed(() => this.scroll.scrollY() > 24);

  /** Hide when scrolling down past the hero, reveal on any upward scroll. */
  readonly hidden = computed(
    () => this.scroll.direction() === 1 && this.scroll.scrollY() > 600 && !this.menuOpen(),
  );

  go(event: Event, anchor: string): void {
    event.preventDefault();
    this.menuOpen.set(false);
    this.scroll.scrollTo(anchor === '#top' ? 0 : anchor);
  }
}
