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
      class="fixed inset-x-0 top-0 z-50 transition-all duration-500 will-change-transform"
      [class.-translate-y-full]="hidden()"
      [class.translate-y-0]="!hidden()"
    >
      <nav
        class="mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-2xl px-5 py-3 transition-all duration-500 max-lg:mx-4"
        [class]="scrolled() ? 'glass shadow-2xl shadow-black/40' : 'border border-transparent'"
        aria-label="Main navigation"
      >
        <a
          href="#top"
          (click)="go($event, '#top')"
          class="group flex items-center gap-2.5 text-[1.05rem] font-semibold tracking-tight"
          aria-label="SkinAlert home"
        >
          <span
            class="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary text-black shadow-lg shadow-primary/30 transition-transform duration-500 group-hover:rotate-12"
          >
            <svg viewBox="0 0 24 24" class="size-4.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 2l7 4v6c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-4z" />
              <circle cx="12" cy="11" r="2.6" />
            </svg>
          </span>
          Skin<span class="text-primary">Alert</span>
        </a>

        <ul class="hidden items-center gap-1 lg:flex">
          @for (link of links; track link.anchor) {
            <li>
              <a
                [href]="link.anchor"
                (click)="go($event, link.anchor)"
                class="rounded-lg px-3.5 py-2 text-sm text-gray-400 transition-colors duration-300 hover:bg-white/5 hover:text-white"
              >
                {{ link.label }}
              </a>
            </li>
          }
        </ul>

        <div class="flex items-center gap-3">
          <a
            href="#cta"
            (click)="go($event, '#cta')"
            appRipple
            class="btn-primary hidden rounded-xl px-5 py-2.5 text-sm font-semibold sm:inline-flex"
          >
            Start Analysis
          </a>

          <button
            type="button"
            class="grid size-10 place-items-center rounded-xl border border-white/10 lg:hidden"
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
        <div id="mobile-menu" class="glass mx-4 mt-2 rounded-2xl p-4 lg:hidden">
          <ul class="flex flex-col gap-1">
            @for (link of links; track link.anchor) {
              <li>
                <a
                  [href]="link.anchor"
                  (click)="go($event, link.anchor)"
                  class="block rounded-lg px-4 py-3 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {{ link.label }}
                </a>
              </li>
            }
            <li class="mt-2">
              <a
                href="#cta"
                (click)="go($event, '#cta')"
                appRipple
                class="btn-primary block rounded-xl px-5 py-3 text-center text-sm font-semibold"
              >
                Start Analysis
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
    { label: 'Features', anchor: '#features' },
    { label: 'Technology', anchor: '#technology' },
    { label: 'How It Works', anchor: '#how-it-works' },
    { label: 'About', anchor: '#about' },
    { label: 'FAQ', anchor: '#faq' },
    { label: 'Contact', anchor: '#contact' },
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
