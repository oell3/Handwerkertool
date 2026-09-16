import { describe, it, expect } from 'vitest';
import { environment } from './environment';

describe('environment', () => {
  it('uses the relative API base for the app proxy', () => {
    expect(environment.apiUrl).toBe('/api');
  });
});
