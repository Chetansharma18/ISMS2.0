import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';
import { LanguageService } from '../services/language.service';

describe('LoadingService', () => {
  let service: LoadingService;
  let lang: LanguageService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
    lang = TestBed.inject(LanguageService);
    lang.setLanguage('en');
  });

  afterEach(() => {
    service.clearAll();
    vi.useRealTimers();
  });

  it('tracks concurrent begin/end operations without premature clearing', () => {
    service.begin();
    service.begin();
    expect(service.isLoading()).toBe(true);
    expect(service.pendingCount()).toBe(2);

    service.end();
    expect(service.isLoading()).toBe(true);
    expect(service.pendingCount()).toBe(1);

    service.end();
    expect(service.isLoading()).toBe(false);
    expect(service.pendingCount()).toBe(0);
  });

  it('applies anti-flicker threshold to page mode and clears immediately on stop', () => {
    const id = service.start({ scope: 'router', mode: 'page', messageKey: 'loadingPage', thresholdMs: 160 });
    expect(service.isLoading()).toBe(true);
    expect(service.isPageLoading()).toBe(false);

    vi.advanceTimersByTime(160);
    expect(service.isPageLoading()).toBe(true);
    expect(service.pageMessage()).toBe('Loading page...');

    service.stop(id);
    expect(service.isPageLoading()).toBe(false);
    expect(service.isLoading()).toBe(false);
  });

  it('shows fullscreen loader with localized English and Hindi messages', () => {
    const id = service.start({ scope: 'auth', mode: 'fullscreen', messageKey: 'signingIn' });
    expect(service.isFullScreenLoading()).toBe(true);
    expect(service.isPageLoading()).toBe(false);
    expect(service.fullScreenMessage()).toBe('Signing in...');

    lang.setLanguage('hi');
    expect(service.fullScreenMessage()).toBe('साइन इन किया जा रहा है...');

    service.stop(id);
    expect(service.isFullScreenLoading()).toBe(false);
  });

  it('stops all operations for a specific scope', () => {
    service.start({ scope: 'upload', mode: 'silent' });
    service.start({ scope: 'upload', mode: 'silent' });
    service.start({ scope: 'other', mode: 'silent' });
    expect(service.pendingCount()).toBe(3);

    service.stopScope('upload');
    expect(service.isScopeLoading('upload')).toBe(false);
    expect(service.isScopeLoading('other')).toBe(true);
    expect(service.pendingCount()).toBe(1);
  });

  it('keeps page loader briefly visible for minVisibleMs on smooth route transitions and clears immediately on cancel', () => {
    const id = service.start({ scope: 'router', mode: 'page', messageKey: 'loadingPage', thresholdMs: 0, minVisibleMs: 220 });
    expect(service.isPageLoading()).toBe(true);

    service.stop(id);
    expect(service.isPageLoading()).toBe(true);

    vi.advanceTimersByTime(220);
    expect(service.isPageLoading()).toBe(false);

    const cancelledId = service.start({ scope: 'router', mode: 'page', messageKey: 'loadingPage', thresholdMs: 0, minVisibleMs: 220 });
    service.stopImmediate(cancelledId);
    expect(service.isPageLoading()).toBe(false);
  });
});
