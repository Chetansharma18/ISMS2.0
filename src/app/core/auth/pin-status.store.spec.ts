import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { PinStatusStore } from './pin-status.store';

describe('PinStatusStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('is unknown until the backend has said, then remembers it per SSO ID', () => {
    const store = TestBed.inject(PinStatusStore);
    expect(store.statusOf('COMMITTEE.MEMBER.1')).toBeNull();

    store.record('COMMITTEE.MEMBER.1', false);
    expect(store.statusOf('committee.member.1')).toBe(false);
    store.record('committee.member.1', true);
    expect(store.statusOf('COMMITTEE.MEMBER.1')).toBe(true);
    expect(store.statusOf('COMMITTEE.MEMBER.2')).toBeNull();
  });

  it('ignores an unknown answer and an empty SSO ID', () => {
    const store = TestBed.inject(PinStatusStore);
    store.record('user.1', true);
    store.record('user.1', null);
    store.record('', false);
    expect(store.statusOf('user.1')).toBe(true);
    expect(store.statusOf('')).toBeNull();
  });

  it('keeps the answer after a reload', () => {
    TestBed.inject(PinStatusStore).record('user.1', true);
    TestBed.resetTestingModule();
    expect(TestBed.inject(PinStatusStore).statusOf('user.1')).toBe(true);
  });
});
