import { Injectable, signal } from '@angular/core';

/**
 * Central source of truth for the user's motion preference.
 * Animation-heavy features (Lenis, GSAP reveals) consult this before
 * doing any work. `?static=1` forces the no-motion path — used for
 * visual audits and automated screenshots.
 */
@Injectable({ providedIn: 'root' })
export class MotionService {
  private readonly query = window.matchMedia('(prefers-reduced-motion: reduce)');
  private readonly forced = new URLSearchParams(window.location.search).has('static');

  readonly reducedMotion = signal(this.forced || this.query.matches);

  constructor() {
    this.query.addEventListener('change', (e) => this.reducedMotion.set(this.forced || e.matches));
  }
}
