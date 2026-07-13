import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { ScrollTrigger } from '../core/gsap';
import { NavbarComponent } from './sections/navbar/navbar.component';
import { HeroComponent } from './sections/hero/hero.component';
import { ManifestoComponent } from './sections/manifesto/manifesto.component';
import { AnalyzerComponent } from './sections/analyzer/analyzer.component';
import { TimelineComponent } from './sections/timeline/timeline.component';
import { StatsComponent } from './sections/stats/stats.component';
import { TechnologyComponent } from './sections/technology/technology.component';
import { FaqComponent } from './sections/faq/faq.component';
import { CtaComponent } from './sections/cta/cta.component';
import { FooterComponent } from './sections/footer/footer.component';

@Component({
  selector: 'app-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NavbarComponent,
    HeroComponent,
    ManifestoComponent,
    AnalyzerComponent,
    TimelineComponent,
    StatsComponent,
    TechnologyComponent,
    FaqComponent,
    CtaComponent,
    FooterComponent,
  ],
  template: `
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-base"
    >
      Sari la conținut
    </a>

    <app-navbar />

    <main id="main">
      <app-hero />
      <app-manifesto />
      <app-analyzer />
      <app-timeline />
      <app-stats />
      <app-technology />
      <app-faq />
      <app-cta />
    </main>

    <app-footer />
  `,
})
export class LandingComponent implements AfterViewInit, OnDestroy {
  ngAfterViewInit(): void {
    const id = setTimeout(() => ScrollTrigger.refresh(), 500);
    this.refreshTimeout = id;
  }

  private refreshTimeout?: ReturnType<typeof setTimeout>;

  ngOnDestroy(): void {
    clearTimeout(this.refreshTimeout);
  }
}
