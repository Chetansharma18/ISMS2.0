import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private renderer: Renderer2;
  private currentTheme = 'default';

  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.setTheme(this.currentTheme);
  }

  setTheme(theme: string) {
    const previous = this.currentTheme;
    this.currentTheme = theme;
    const root = document.documentElement;
    this.renderer.setAttribute(root, 'data-theme', theme);
    // Optionally, you could add class for dark mode etc.
  }

  getTheme(): string {
    return this.currentTheme;
  }
}
