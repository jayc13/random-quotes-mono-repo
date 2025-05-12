import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireUserAuthMiddleware } from '@/middlewares/userAuth.middleware';
import { IRequest, error } from 'itty-router';
import { Env } from '@/types/env.types';
import { ExecutionContext } from '@cloudflare/workers-types';
import { DEFAULT_CORS_HEADERS } from '@/utils/constants';

const mockEnv = {} as Env;
const mockCtxBase: ExecutionContext = {
  waitUntil: vi.fn(),
  passThroughOnException: vi.fn(),
};

describe('requireUserAuthMiddleware', () => {
  let mockRequest: IRequest;
  let mockCtx: ExecutionContext & { props: any };

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      url: 'http://localhost/me/profile',
      headers: new Headers(),
      params: {},
      query: {},
      proxy: undefined,
    } as IRequest;

    mockCtx = { 
      ...mockCtxBase, 
      props: {} // Initialize props for each test
    };
  });

  it('should allow access if ctx.props.user.sub is present', async () => {
    mockCtx.props.user = { sub: 'user123' };

    const result = requireUserAuthMiddleware(mockRequest, mockEnv, mockCtx);
    
    expect(result).toBeUndefined(); // Middleware should not return a response, allowing request to proceed
  });

  it('should return 401 Unauthorized if ctx.props.user.sub is not present', async () => {
    mockCtx.props.user = { email: 'test@example.com' }; // 'sub' is missing

    const response = requireUserAuthMiddleware(mockRequest, mockEnv, mockCtx);
    
    expect(response).toBeInstanceOf(Response);
    expect(response?.status).toBe(401);
    const body = await response?.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Unauthorized. User authentication required.');
    expect(response?.headers.get('access-control-allow-origin')).toBe(DEFAULT_CORS_HEADERS['Access-Control-Allow-Origin']);
  });

  it('should return 401 Unauthorized if ctx.props.user is not present', async () => {
    // mockCtx.props.user is not set (remains undefined from initialization of mockCtx.props = {})
    
    const response = requireUserAuthMiddleware(mockRequest, mockEnv, mockCtx);
    
    expect(response).toBeInstanceOf(Response);
    expect(response?.status).toBe(401);
    const body = await response?.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Unauthorized. User authentication required.');
  });
  
  it('should return 401 Unauthorized if ctx.props itself is not present', async () => {
    const ctxWithoutProps = { ...mockCtxBase } as ExecutionContext & { props: any }; // No props property

    const response = requireUserAuthMiddleware(mockRequest, mockEnv, ctxWithoutProps);
    
    expect(response).toBeInstanceOf(Response);
    expect(response?.status).toBe(401);
    const body = await response?.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Unauthorized. User authentication required.');
  });
});
