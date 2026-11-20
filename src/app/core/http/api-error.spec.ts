import { describe, it, expect } from 'vitest';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ApiError, defaultErrorMessage, toApiError } from './api-error';

describe('toApiError', () => {
  it('uses the backend message, code and correlation id', () => {
    const err = toApiError(
      new HttpErrorResponse({
        status: 409,
        error: { success: false, code: 'DUPLICATE', message: 'Sector already exists.' },
        headers: new HttpHeaders({ 'X-Correlation-ID': 'abc-123' })
      })
    );
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(409);
    expect(err.code).toBe('DUPLICATE');
    expect(err.message).toBe('Sector already exists.');
    expect(err.correlationId).toBe('abc-123');
  });

  it('flattens ASP.NET style validation errors', () => {
    const err = toApiError(
      new HttpErrorResponse({ status: 400, error: { title: 'Validation failed', errors: { Name: ['Name is required.'], Code: ['Too long.'] } } })
    );
    expect(err.isValidation).toBe(true);
    expect(err.message).toBe('Validation failed');
    expect(err.errors).toEqual(['Name is required.', 'Too long.']);
  });

  it('falls back to a plain message by status, and ignores HTML error pages', () => {
    expect(toApiError(new HttpErrorResponse({ status: 0 })).message).toBe(defaultErrorMessage(0));
    expect(toApiError(new HttpErrorResponse({ status: 502, error: '<html>Bad gateway</html>' })).message).toBe(defaultErrorMessage(502));
    expect(toApiError(new HttpErrorResponse({ status: 418 })).message).toBe(defaultErrorMessage(418));
  });

  it('maps an rxjs timeout to 408 and passes ApiError through', () => {
    const timeout = Object.assign(new Error('Timeout has occurred'), { name: 'TimeoutError' });
    expect(toApiError(timeout).status).toBe(408);
    const existing = new ApiError(403, 'No');
    expect(toApiError(existing)).toBe(existing);
  });
});
