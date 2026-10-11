import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('queues typed notifications with unique ids', () => {
    service.success('Saved', 'Done');
    service.error('Failed');
    const list = service.notifications();
    expect(list.length).toBe(2);
    expect(list[0].type).toBe('success');
    expect(list[0].title).toBe('Done');
    expect(list[1].type).toBe('error');
    expect(list[0].id).not.toBe(list[1].id);
  });

  it('auto-dismisses after the default 4 seconds', () => {
    service.info('Hello');
    expect(service.notifications().length).toBe(1);
    vi.advanceTimersByTime(3999);
    expect(service.notifications().length).toBe(1);
    vi.advanceTimersByTime(1);
    expect(service.notifications().length).toBe(0);
  });

  it('keeps a notification forever when duration is 0', () => {
    service.show({ type: 'warning', message: 'Sticky', duration: 0 });
    vi.advanceTimersByTime(60000);
    expect(service.notifications().length).toBe(1);
  });

  it('dismiss removes only the targeted notification', () => {
    service.show({ type: 'info', message: 'A', duration: 0 });
    service.show({ type: 'info', message: 'B', duration: 0 });
    const [first] = service.notifications();
    service.dismiss(first.id);
    expect(service.notifications().map(n => n.message)).toEqual(['B']);
  });
});
