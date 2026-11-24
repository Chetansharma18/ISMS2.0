import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { NewsTickerComponent } from './news-ticker.component';

describe('NewsTickerComponent', () => {
  let fixture: ComponentFixture<NewsTickerComponent>;
  let component: NewsTickerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsTickerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(NewsTickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('contains announcements with explicit language identification for both Hindi and English', () => {
    expect(component.announcements.length).toBeGreaterThan(0);

    const hindiItems = component.announcements.filter(item => item.lang === 'hi');
    const englishItems = component.announcements.filter(item => item.lang === 'en');

    expect(hindiItems.length).toBeGreaterThan(0);
    expect(englishItems.length).toBeGreaterThan(0);
    expect(hindiItems.every(i => i.text.length > 0 && i.date.length > 0)).toBe(true);
    expect(englishItems.every(i => i.text.length > 0 && i.date.length > 0)).toBe(true);
  });

  it('renders language badges and lang attributes in the ticker track', () => {
    const el = fixture.nativeElement as HTMLElement;
    const links = el.querySelectorAll('.ticker-link');
    expect(links.length).toBeGreaterThan(0);

    const firstLink = links[0] as HTMLElement;
    expect(firstLink.getAttribute('lang')).toBeDefined();

    const badges = el.querySelectorAll('.ticker-track span');
    const badgeTexts = Array.from(badges).map(b => b.textContent?.trim());
    expect(badgeTexts).toContain('HI');
    expect(badgeTexts).toContain('EN');
  });
});
