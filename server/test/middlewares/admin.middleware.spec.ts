import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isAdminMiddleware } from '@/middlewares/admin.middleware';
import * as authUtils from '@/middlewares/authentication.middleware'; // To mock 'isAdmin'
import { IRequest, error } from 'itty-router'; // error is used by the middleware
import { Env } from '@/types/env.types';
import { ExecutionContext } from '@cloudflare/workers-types';
import { DEFAULT_CORS_HEADERS } from '@/utils/constants';

// Mock the checkIsAdmin function from authentication.middleware
vi.mock('@/middlewares/authentication.middleware', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual, // Import and spread all actual exports
    isAdmin: vi.fn(), // Mock the isAdmin function
  };
});

const mockEnv = {} as Env; // Cast to Env, assuming not used by this specific middleware
const mockCtxBase: ExecutionContext = {
  waitUntil: vi.fn(),
  passThroughOnException: vi.fn(),
};

describe('isAdminMiddleware', () => {
  let mockRequest: IRequest;
  let mockCtx: ExecutionContext & { props: any }; // Add props to context for tests

  beforeEach(() => {
    vi.resetAllMocks(); // Reset all mocks

    mockRequest = {
      method: 'GET',
      url: 'http://localhost/admin/test',
      headers: new Headers(),
      params: {},
      query: {},
      proxy: undefined,
    } as IRequest;

    // Initialize ctx.props for each test
    mockCtx = { 
      ...mockCtxBase, 
      props: { 
        user: { sub: 'user123' } // Default to having a user
      } 
    };
  });

  it('should allow access if user is an admin', async () => {
    (authUtils.isAdmin as vi.Mock).mockResolvedValue(true);

    // In itty-router, a middleware that doesn't return a Response implicitly calls next()
    const response = await isAdminMiddleware(mockRequest, mockEnv, mockCtx);

    expect(response).toBeInstanceOf(Response);
    expect(response?.status).toBe(403);
    const body = await response?.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Forbidden. Admin privileges required.');
  });

  it('should return 403 Forbidden if user is not an admin', async () => {
    (authUtils.isAdmin as vi.Mock).mockResolvedValue(false);

    const response = await isAdminMiddleware(mockRequest, mockEnv, mockCtx);
    
    expect(response).toBeInstanceOf(Response);
    expect(response?.status).toBe(403);
    const body = await response?.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Forbidden. Admin privileges required.');
  });

  it('should return 401 Unauthorized if ctx.props.user is not set', async () => {
    mockCtx.props.user = undefined; // Simulate user not being set by previous middleware

    const response = await isAdminMiddleware(mockRequest, mockEnv, mockCtx);

    expect(response).toBeInstanceOf(Response);
    expect(response?.status).toBe(401);
    const body = await response?.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Unauthorized. User not authenticated.');
    expect(authUtils.isAdmin).not.toHaveBeenCalled(); // isAdmin check should not be reached
  });
  
  it('should return 401 Unauthorized if ctx.props.user.sub is not set', async () => {
    mockCtx.props.user = { name: 'test' }; // User object exists but no 'sub'

    const response = await isAdminMiddleware(mockRequest, mockEnv, mockCtx);

    expect(response).toBeInstanceOf(Response);
    expect(response?.status).toBe(401);
    const body = await response?.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Unauthorized. User not authenticated.');
    expect(authUtils.isAdmin).not.toHaveBeenCalled();
  });
  
  it('should return 401 Unauthorized if ctx.props is not set at all', async () => {
    // Create a context without props
    const ctxWithoutProps = { ...mockCtxBase } as ExecutionContext & { props: any };

    const response = await isAdminMiddleware(mockRequest, mockEnv, ctxWithoutProps);

    expect(response).toBeInstanceOf(Response);
    expect(response?.status).toBe(401);
    const body = await response?.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Unauthorized. User not authenticated.');
    expect(authUtils.isAdmin).not.toHaveBeenCalled();
  });
});
