import { describe, expect, it } from 'vitest';
import { ExternalServiceError } from './server-errors';
import { parseJsonResponse } from './server-ai';

describe('parseJsonResponse', () => {
  it('parses valid json payloads', () => {
    expect(parseJsonResponse<{ ok: boolean }>('{\"ok\":true}', 'test.context')).toEqual({ ok: true });
  });

  it('throws structured errors for invalid payloads', () => {
    expect(() => parseJsonResponse('not-json', 'test.context')).toThrow(ExternalServiceError);
  });
});