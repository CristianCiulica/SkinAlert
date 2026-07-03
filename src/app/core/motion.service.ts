import { Injectable, signal } from '@angular/core';

/**
 * Central source of truth for the user's motion preference.
 * Animation-heavy features (Lenis, GSAP reveals, Three.js autoplay)
 * consult this before doing any work.
 */
@Injectable({ providedIn: 'root' })
export class MotionService {
  private readonly query = window.matchMedia('(prefers-reduced-motion: reduce)');

  readonly reducedMotion = signal(this.query.matches);

  constructor() {
    this.query.addEventListener('change', (e) => this.reducedMotion.set(e.matches));
  }
}
