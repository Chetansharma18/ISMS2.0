import { describe, it, expect } from 'vitest';
import { formatFileSizeMb } from './aspirant-file.util';

describe('aspirant-file.util', () => {
  it('formats whole megabytes with one decimal', () => {
    expect(formatFileSizeMb(1024 * 1024)).toBe('1.0 MB');
    expect(formatFileSizeMb(5 * 1024 * 1024)).toBe('5.0 MB');
  });

  it('rounds to one decimal place', () => {
    expect(formatFileSizeMb(1.5 * 1024 * 1024)).toBe('1.5 MB');
    expect(formatFileSizeMb(2.26 * 1024 * 1024)).toBe('2.3 MB');
  });

  it('shows small files as 0.0 MB', () => {
    expect(formatFileSizeMb(0)).toBe('0.0 MB');
    expect(formatFileSizeMb(1024)).toBe('0.0 MB');
  });
});
