import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateIdParam } from '@/middlewares/validation.middleware';
import { IRequest, error } from 'itty-router';
import { Env } from '@/types/env.types';
import { ExecutionContext } from '@cloudflare/workers-types';
import { DEFAULT_CORS_HEADERS } from '@/utils/constants';

const mockEnv = {} as Env;
const mockCtx: ExecutionContext = {
  waitUntil: vi.fn(),
  passThroughOnException: vi.fn(),
};

describe('validateIdParam Middleware', () => {
  let mockRequest: IRequest;

  beforeEach(() => {
    // Base mock request, params will be overridden in tests
    mockRequest = {
      method: 'GET',
      url: 'http://localhost/items/123',
      headers: new Headers(),
      params: {}, // Initialize params
      query: {},
      proxy: undefined,
    } as IRequest;
  });

  it('should allow access if request.params.id is a valid numeric string', () => {
    mockRequest.params = { id: '123' };
    const result = validateIdParam(mockRequest, mockEnv, mockCtx);
    expect(result).toBeUndefined(); // Middleware allows request to proceed
  });

  it('should return 400 Bad Request if request.params.id is not a numeric string', () => {
    mockRequest.params = { id: 'abc' };
    const response = validateIdParam(mockRequest, mockEnv, mockCtx);

    expect(response).toBeInstanceOf(Response);
    expect(response?.status).toBe(400);
    const body = response ? await response.json() : {};
    expect(body.success).toBe(false);
    expect(body.error).toBe('Invalid ID format');
    expect(response?.headers.get('access-control-allow-origin')).toBe(DEFAULT_CORS_HEADERS['Access-Control-Allow-Origin']);
  });

  it('should return 400 Bad Request if request.params.id is an empty string', () => {
    mockRequest.params = { id: '' };
    const response = validateIdParam(mockRequest, mockEnv, mockCtx);

    expect(response).toBeInstanceOf(Response);
    expect(response?.status).toBe(400);
     const body = response ? await response.json() : {};
    expect(body.success).toBe(false);
    expect(body.error).toBe('Invalid ID format');
  });
  
  it('should return 400 Bad Request if request.params.id contains non-numeric characters', () => {
    mockRequest.params = { id: '123x' };
    const response = validateIdParam(mockRequest, mockEnv, mockCtx);

    expect(response).toBeInstanceOf(Response);
    expect(response?.status).toBe(400);
    const body = response ? await response.json() : {};
    expect(body.success).toBe(false);
    expect(body.error).toBe('Invalid ID format');
  });

  it('should return 400 Bad Request if request.params.id is missing (undefined)', () => {
    // mockRequest.params is already {}
    const response = validateIdParam(mockRequest, mockEnv, mockCtx);
    
    expect(response).toBeInstanceOf(Response);
    expect(response?.status).toBe(400);
    const body = response ? await response.json() : {};
    expect(body.success).toBe(false);
    expect(body.error).toBe('Invalid ID format');
  });
  
   it('should return 400 Bad Request if request.params itself is missing (less likely with itty-router if param is in route)', () => {
    // Simulate request.params being undefined, though itty-router usually ensures it's an object
    const requestWithoutParams = { ...mockRequest, params: undefined } as unknown as IRequest;
    const response = validateIdParam(requestWithoutParams, mockEnv, mockCtx);
    
    expect(response).toBeInstanceOf(Response);
    expect(response?.status).toBe(400);
    const body = response ? await response.json() : {};
    expect(body.success).toBe(false);
    expect(body.error).toBe('Invalid ID format');
  });
});
