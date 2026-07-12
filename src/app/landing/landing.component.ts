import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { ScrollTrigger } from '../core/gsap';
import { NavbarComponent } from './sections/navbar/navbar.component';
import { HeroComponent } from './sections/hero/hero.component';
import { StatsComponent } from './sections/stats/stats.component';
import { TimelineComponent } from './sections/timeline/timeline.component';
import { TechnologyComponent } from './sections/technology/technology.component';
import { FeatureGridComponent } from './sections/feature-grid/feature-grid.component';
import { ComparisonComponent } from './sections/comparison/comparison.component';
import { DisclaimerComponent } from './sections/disclaimer/disclaimer.component';
import { FaqComponent } from './sections/faq/faq.component';
import { CtaComponent } from './sections/cta/cta.component';
import { AnalyzerComponent } from './sections/analyzer/analyzer.component';
import { FooterComponent } from './sections/footer/footer.component';

@Component({
  selector: 'app-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NavbarComponent,
    HeroComponent,
    StatsComponent,
    TimelineComponent,
    TechnologyComponent,
    FeatureGridComponent,
    ComparisonComponent,
    DisclaimerComponent,
    FaqComponent,
    CtaComponent,
    AnalyzerComponent,
    FooterComponent,
  ],
  template: `
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
    >
      Sari la conținut
    </a>

    <app-navbar />

    <main id="main">
      <app-hero />
      <app-analyzer />
      <app-stats />
      <app-timeline />
      <app-technology />
      <app-feature-grid />
      <app-comparison />
      <app-disclaimer />
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
