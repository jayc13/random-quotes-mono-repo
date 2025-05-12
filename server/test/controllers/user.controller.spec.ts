import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { updateUserNameHandler } from '@/controllers/user.controller';
import { UserService, Auth0User } from '@/services/user.service'; // Actual UserService for type, mocked below
import { Env } from '@/types/env.types';
import { IRequest } from 'itty-router'; // Using IRequest for base type

// Mock UserService
const mockUpdateUserName = vi.fn();
const mockSendForgotPasswordEmail = vi.fn();
const mockDeleteUserAccount = vi.fn();

vi.mock('@/services/user.service', () => {
  return {
    Auth0User: vi.fn(), 
    UserService: vi.fn().mockImplementation(() => ({
      updateUserName: mockUpdateUserName,
      sendForgotPasswordEmail: mockSendForgotPasswordEmail,
      deleteUserAccount: mockDeleteUserAccount,
    })),
  };
});


// Mock Env object
const mockEnv = {
  AUTH0_MANAGEMENT_DOMAIN: 'test-domain.auth0.com',
  // ... other env properties if needed
} as Env;

// Mock ExecutionContext
const mockCtx: ExecutionContext = {
  waitUntil: vi.fn(),
  passThroughOnException: vi.fn(),
};

describe('User Controller - updateUserNameHandler', () => {
  // Define mockRequest with a more specific type for props and json
  let mockRequest: Partial<IRequest & { 
    props: { user?: { sub?: string }, accessGranted?: boolean, originAllowed?: boolean }; 
    json: () => Promise<any> 
  }>;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Reset the specific mock functions
    mockUpdateUserName.mockReset();
    mockSendForgotPasswordEmail.mockReset();
    mockDeleteUserAccount.mockReset();

    // Setup default mock request structure for each test
    mockRequest = {
      method: 'PATCH',
      url: 'http://localhost/users/me/name',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      props: { // Simulate props added by middleware
        user: { sub: 'auth0|testuser123' }, // Simulate authenticated user
        accessGranted: true,
        originAllowed: true,
      },
      json: vi.fn(), // Mock the json method for request body parsing
    };
  });

  it('should update user name successfully with valid data', async () => {
    const nameParts = { given_name: 'Test', family_name: 'User' };
    const updatedUserMock: Auth0User = { 
      user_id: 'auth0|testuser123', 
      given_name: 'Test', 
      family_name: 'User',
      email: 'test@example.com' 
    };

    (mockRequest.json as vi.Mock).mockResolvedValue(nameParts);
    mockUpdateUserName.mockResolvedValue(updatedUserMock); // UserService.updateUserName is mocked

    const response = await updateUserNameHandler(mockRequest as IRequest, mockEnv, mockCtx);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody.success).toBe(true);
    expect(responseBody.message).toBe('User name updated successfully.');
    expect(responseBody.data).toEqual(updatedUserMock);
    // Check that the mocked service method was called correctly
    expect(mockUpdateUserName).toHaveBeenCalledWith(mockEnv, 'auth0|testuser123', nameParts);
  });

  it('should return 400 if request body is an empty object', async () => {
    (mockRequest.json as vi.Mock).mockResolvedValue({}); // Empty object

    const response = await updateUserNameHandler(mockRequest as IRequest, mockEnv, mockCtx);
    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody.success).toBe(false);
    expect(responseBody.error).toContain('Invalid request body. At least one valid name part');
    expect(mockUpdateUserName).not.toHaveBeenCalled();
  });

  it('should return 400 if request body provides non-string value for a name part', async () => {
    (mockRequest.json as vi.Mock).mockResolvedValue({ given_name: 123, name: "Valid Name" }); // Invalid type for given_name

    const response = await updateUserNameHandler(mockRequest as IRequest, mockEnv, mockCtx);
    const responseBody = await response.json();

    expect(response.status).toBe(400); // This should be caught by the controller's validation
    expect(responseBody.success).toBe(false);
    expect(responseBody.error).toContain('Invalid request body. At least one valid name part');
    expect(mockUpdateUserName).not.toHaveBeenCalled();
  });
  
  it('should return 400 if request body is not valid JSON (SyntaxError)', async () => {
    (mockRequest.json as vi.Mock).mockRejectedValue(new SyntaxError('Unexpected token'));

    const response = await updateUserNameHandler(mockRequest as IRequest, mockEnv, mockCtx);
    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody.success).toBe(false);
    expect(responseBody.error).toBe('Invalid JSON in request body.');
    expect(mockUpdateUserName).not.toHaveBeenCalled();
  });
  
  it('should return 400 if request body parsing fails for other reasons', async () => {
    (mockRequest.json as vi.Mock).mockRejectedValue(new Error('Failed to parse body')); 

    const response = await updateUserNameHandler(mockRequest as IRequest, mockEnv, mockCtx);
    const responseBody = await response.json();
    
    expect(response.status).toBe(400);
    expect(responseBody.success).toBe(false);
    expect(responseBody.error).toContain('Failed to parse request body.');
    expect(mockUpdateUserName).not.toHaveBeenCalled();
  });

  it('should return 401 if user ID (sub) is not found in request props', async () => {
    if(mockRequest.props) mockRequest.props.user = {}; // No 'sub' property

    const response = await updateUserNameHandler(mockRequest as IRequest, mockEnv, mockCtx);
    const responseBody = await response.json();

    expect(response.status).toBe(401);
    expect(responseBody.success).toBe(false);
    expect(responseBody.error).toBe('Unauthorized. User ID not found.');
    expect(mockUpdateUserName).not.toHaveBeenCalled();
  });
  
  it('should return 502 if user service call for Auth0 fails (e.g. Auth0 down)', async () => {
    const nameParts = { given_name: 'Test' };
    (mockRequest.json as vi.Mock).mockResolvedValue(nameParts);
    mockUpdateUserName.mockRejectedValue(new Error('Auth0 Management API request failed: Some Auth0 error'));

    const response = await updateUserNameHandler(mockRequest as IRequest, mockEnv, mockCtx);
    const responseBody = await response.json();

    expect(response.status).toBe(502); // Bad Gateway
    expect(responseBody.success).toBe(false);
    expect(responseBody.error).toBe('Failed to update user name with external provider.');
    expect(responseBody.details).toContain('Auth0 Management API request failed');
  });

  it('should return 500 for other unexpected errors from user service', async () => {
    const nameParts = { given_name: 'Test' };
    (mockRequest.json as vi.Mock).mockResolvedValue(nameParts);
    mockUpdateUserName.mockRejectedValue(new Error('Some unexpected internal error'));

    const response = await updateUserNameHandler(mockRequest as IRequest, mockEnv, mockCtx);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody.success).toBe(false);
    expect(responseBody.error).toBe('An unexpected error occurred while updating user name.');
    expect(responseBody.details).toContain('Some unexpected internal error');
  });

  afterEach(() => {
    // This is good practice, though vi.clearAllMocks() in beforeEach usually handles it.
    vi.restoreAllMocks();
  });
});

describe('User Controller - sendForgotPasswordEmailHandler', () => {
  let mockRequest: Partial<IRequest & { 
    props: { user?: { sub?: string, email?: string }, accessGranted?: boolean, originAllowed?: boolean }; 
    // No json method needed as this handler doesn't read body
  }>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSendForgotPasswordEmail.mockReset();

    mockRequest = {
      method: 'POST',
      url: 'http://localhost/users/me/forgot-password',
      headers: new Headers(),
      props: {
        user: { sub: 'auth0|testuser123', email: 'test@example.com' },
        accessGranted: true,
        originAllowed: true,
      },
    };
  });

  it('should send forgot password email successfully for authenticated user', async () => {
    mockSendForgotPasswordEmail.mockResolvedValue(undefined); // Service method is void

    const response = await sendForgotPasswordEmailHandler(mockRequest as IRequest, mockEnv, mockCtx);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody.success).toBe(true);
    expect(responseBody.message).toContain('If an account exists for test@example.com');
    expect(mockSendForgotPasswordEmail).toHaveBeenCalledWith(mockEnv, 'test@example.com');
  });

  it('should return 401 if user ID (sub) is missing', async () => {
    if (mockRequest.props) mockRequest.props.user = { email: 'test@example.com' }; // Missing sub

    const response = await sendForgotPasswordEmailHandler(mockRequest as IRequest, mockEnv, mockCtx);
    const responseBody = await response.json();

    expect(response.status).toBe(401);
    expect(responseBody.success).toBe(false);
    expect(responseBody.error).toBe('Unauthorized. User identifier not found.');
    expect(mockSendForgotPasswordEmail).not.toHaveBeenCalled();
  });

  it('should return 400 if user email is missing from token props', async () => {
    if (mockRequest.props) mockRequest.props.user = { sub: 'auth0|testuser123' }; // Missing email

    const response = await sendForgotPasswordEmailHandler(mockRequest as IRequest, mockEnv, mockCtx);
    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody.success).toBe(false);
    expect(responseBody.error).toBe('User email not found in token. Cannot initiate password reset.');
    expect(mockSendForgotPasswordEmail).not.toHaveBeenCalled();
  });
  
  it('should return 502 if user service fails to send email (Auth0 error)', async () => {
    mockSendForgotPasswordEmail.mockRejectedValue(new Error('Auth0 Management API request failed: Some Auth0 error'));

    const response = await sendForgotPasswordEmailHandler(mockRequest as IRequest, mockEnv, mockCtx);
    const responseBody = await response.json();

    expect(response.status).toBe(502);
    expect(responseBody.success).toBe(false);
    expect(responseBody.error).toBe('Failed to initiate password reset with external provider.');
    expect(responseBody.details).toContain('Auth0 Management API request failed');
  });

  it('should return 500 for other unexpected errors from user service', async () => {
    mockSendForgotPasswordEmail.mockRejectedValue(new Error('Some unexpected internal error'));

    const response = await sendForgotPasswordEmailHandler(mockRequest as IRequest, mockEnv, mockCtx);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody.success).toBe(false);
    expect(responseBody.error).toBe('An unexpected error occurred while initiating password reset.');
    expect(responseBody.details).toContain('Some unexpected internal error');
  });
});

describe('User Controller - deleteUserAccountHandler', () => {
  let mockRequest: Partial<IRequest & { 
    props: { user?: { sub?: string }, accessGranted?: boolean, originAllowed?: boolean }; 
    // No json method needed
  }>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteUserAccount.mockReset();

    mockRequest = {
      method: 'DELETE',
      url: 'http://localhost/users/me',
      headers: new Headers(),
      props: {
        user: { sub: 'auth0|testuser123' },
        accessGranted: true,
        originAllowed: true,
      },
    };
  });

  it('should delete user account successfully', async () => {
    mockDeleteUserAccount.mockResolvedValue(undefined); // Service method is void

    const response = await deleteUserAccountHandler(mockRequest as IRequest, mockEnv, mockCtx);
    const responseBody = await response.json();

    expect(response.status).toBe(200); // Or 204 if no body is returned by handler
    expect(responseBody.success).toBe(true);
    expect(responseBody.message).toContain('User account auth0|testuser123 has been successfully scheduled for deletion.');
    expect(mockDeleteUserAccount).toHaveBeenCalledWith(mockEnv, 'auth0|testuser123');
  });

  it('should return 401 if user ID (sub) is missing', async () => {
    if (mockRequest.props) mockRequest.props.user = {}; // Missing sub

    const response = await deleteUserAccountHandler(mockRequest as IRequest, mockEnv, mockCtx);
    const responseBody = await response.json();

    expect(response.status).toBe(401);
    expect(responseBody.success).toBe(false);
    expect(responseBody.error).toBe('Unauthorized. User ID not found.');
    expect(mockDeleteUserAccount).not.toHaveBeenCalled();
  });
  
  it('should return 502 if user service fails to delete (e.g., Auth0 error)', async () => {
    mockDeleteUserAccount.mockRejectedValue(new Error('Auth0 Management API request failed: User not found'));

    const response = await deleteUserAccountHandler(mockRequest as IRequest, mockEnv, mockCtx);
    const responseBody = await response.json();

    expect(response.status).toBe(502);
    expect(responseBody.success).toBe(false);
    expect(responseBody.error).toBe('Failed to delete user account with external provider.');
    expect(responseBody.details).toContain('Auth0 Management API request failed: User not found');
  });

  it('should return 500 for other unexpected errors from user service', async () => {
    mockDeleteUserAccount.mockRejectedValue(new Error('Some unexpected internal error'));

    const response = await deleteUserAccountHandler(mockRequest as IRequest, mockEnv, mockCtx);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody.success).toBe(false);
    expect(responseBody.error).toBe('An unexpected error occurred while deleting user account.');
    expect(responseBody.details).toContain('Some unexpected internal error');
  });
});
