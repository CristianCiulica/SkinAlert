import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ScrollService } from './core/scroll.service';
import { LandingComponent } from './landing/landing.component';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LandingComponent],
  template: `<app-landing />`,
})
export class App implements OnInit {
  private readonly scroll = inject(ScrollService);

  ngOnInit(): void {
    this.scroll.init();
  }
}
