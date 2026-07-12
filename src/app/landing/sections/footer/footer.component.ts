import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ScrollService } from '../../../core/scroll.service';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';

interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SafeHtmlPipe],
  template: `
    <footer id="contact" class="border-t border-black/5 bg-surface">
      <div class="mx-auto max-w-7xl px-6 py-16">
        <div class="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <a href="#top" (click)="go($event, '#top')" class="flex items-center gap-2.5 text-lg font-bold tracking-tight text-black" aria-label="SkinAlert home">
              <span class="grid size-8 place-items-center rounded-lg bg-black text-white">
                <svg viewBox="0 0 24 24" class="size-4.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M12 2l7 4v6c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-4z"/><circle cx="12" cy="11" r="2.6"/>
                </svg>
              </span>
              Skin<span class="text-black/50">Alert</span>
            </a>
            <p class="mt-5 max-w-xs text-sm leading-relaxed font-medium text-black/60">
              Detectare timpurie. Decizii mai inteligente. Asistent dermatologic bazat pe AI care te îndrumă mereu către îngrijire profesională.
            </p>
            <div class="mt-6 flex gap-3">
              @for (social of socials; track social.label) {
                <a
                  [href]="social.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  [attr.aria-label]="social.label"
                  class="grid size-10 place-items-center rounded-xl border border-black/10 text-black/40 transition-all duration-300 hover:-translate-y-0.5 hover:border-black/30 hover:text-black"
                  [innerHTML]="social.icon | safeHtml"
                ></a>
              }
            </div>
          </div>

          @for (col of columns; track col.title) {
            <nav [attr.aria-label]="col.title">
              <h3 class="text-sm font-bold tracking-wide text-black">{{ col.title }}</h3>
              <ul class="mt-5 space-y-3">
                @for (link of col.links; track link.label) {
                  <li>
                    <a
                      [href]="link.href"
                      (click)="link.href.startsWith('#') && link.href.length > 1 ? go($event, link.href) : null"
                      class="text-sm font-medium text-black/50 transition-colors duration-300 hover:text-black"
                    >{{ link.label }}</a>
                  </li>
                }
              </ul>
            </nav>
          }
        </div>

        <div class="mt-14 flex flex-col items-center justify-between gap-4 border-t border-black/5 pt-8 text-xs font-bold text-black/40 sm:flex-row">
          <p>© {{ year }} SkinAlert. Toate drepturile rezervate.</p>
          <p>Nu este un dispozitiv medical. Consultă întotdeauna un dermatolog calificat.</p>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  private readonly scroll = inject(ScrollService);
  readonly year = new Date().getFullYear();

  readonly columns: FooterColumn[] = [
    {
      title: 'Produs',
      links: [
        { label: 'Funcționalități', href: '#features' },
        { label: 'Tehnologie', href: '#technology' },
        { label: 'Cum funcționează', href: '#how-it-works' },
        { label: 'FAQ', href: '#faq' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Confidențialitate', href: '#' },
        { label: 'Termeni și Condiții', href: '#' },
        { label: 'Declarație Medicală', href: '#about' },
      ],
    },
    {
      title: 'Contact',
      links: [
        { label: 'Email', href: 'mailto:hello@skinalert.app' },
        { label: 'GitHub', href: 'https://github.com' },
        { label: 'Kit de presă', href: '#' },
      ],
    },
  ];

  readonly socials = [
    {
      label: 'GitHub',
      href: 'https://github.com',
      icon: `<svg viewBox="0 0 24 24" class="size-4.5" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.34.95.11-.74.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.78 1.05.78 2.12v3.15c0 .3.21.66.8.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>`,
    },
    {
      label: 'X (Twitter)',
      href: 'https://x.com',
      icon: `<svg viewBox="0 0 24 24" class="size-4" fill="currentColor" aria-hidden="true"><path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41z"/></svg>`,
    },
    {
      label: 'LinkedIn',
      href: 'https://linkedin.com',
      icon: `<svg viewBox="0 0 24 24" class="size-4.5" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0z"/></svg>`,
    },
  ];

  go(event: Event, anchor: string): void {
    event.preventDefault();
    this.scroll.scrollTo(anchor === '#top' ? 0 : anchor);
  }
}
