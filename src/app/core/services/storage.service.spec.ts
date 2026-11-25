import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
  });

  it('round-trips JSON values in localStorage', () => {
    service.setItem('k', { a: 1 });
    expect(service.getItem<{ a: number }>('k')).toEqual({ a: 1 });
    service.removeItem('k');
    expect(service.getItem('k')).toBeNull();
  });

  it('returns null for malformed JSON instead of throwing', () => {
    localStorage.setItem('bad', '{not json');
    expect(service.getItem('bad')).toBeNull();
  });

  it('stores raw strings without adding JSON quotes', () => {
    service.setString('token', 'abc123');
    expect(localStorage.getItem('token')).toBe('abc123');
    expect(service.getString('token')).toBe('abc123');
    expect(service.getString('missing')).toBeNull();
  });

  it('keeps sessionStorage separate from localStorage', () => {
    service.setSessionString('flag', 'true');
    service.setSessionItem('obj', { b: 2 });
    expect(sessionStorage.getItem('flag')).toBe('true');
    expect(localStorage.getItem('flag')).toBeNull();
    expect(service.getSessionItem<{ b: number }>('obj')).toEqual({ b: 2 });
    service.removeSessionItem('flag');
    expect(service.getSessionString('flag')).toBeNull();
  });
});
