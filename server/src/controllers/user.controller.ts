import { IRequest, error, json } from 'itty-router';
import { UserService, Auth0User } from '../services/user.service';
import { Env } from '../types/env.types';
import { ExecutionContext } from '@cloudflare/workers-types';

// Define a type for the expected request properties after authentication middleware
interface AuthenticatedRequest extends IRequest {
  props?: {
    user?: {
      sub?: string; // User ID from JWT 'sub' claim
      email?: string; // User email from JWT custom claim or Auth0 profile
    };
    accessGranted?: boolean; // Flag from access control middleware
  };
}

// Define the expected structure for name parts in the request body
interface NamePartsRequestBody {
  given_name?: string;
  family_name?: string;
  nickname?: string;
  name?: string;
}


export async function updateUserNameHandler(request: AuthenticatedRequest, env: Env, ctx: ExecutionContext): Promise<Response> {
  const userService = new UserService();
  
  // Extract userId from request.props.user.sub (set by authenticationMiddleware)
  const userId = request.props?.user?.sub;

  if (!userId) {
    // This should ideally be caught by authenticationMiddleware, but as a safeguard:
    return error(401, { success: false, error: 'Unauthorized. User ID not found.' });
  }

  let nameParts: NamePartsRequestBody;
  try {
    nameParts = await request.json();
    if (!nameParts || typeof nameParts !== 'object') {
      throw new Error('Invalid request body: expected an object.');
    }
  } catch (e: any) {
    if (e instanceof SyntaxError) {
      return error(400, { success: false, error: 'Invalid JSON in request body.' });
    }
    return error(400, { success: false, error: e.message || 'Failed to parse request body.' });
  }
  
  // Validate that at least one name part is present and all provided parts are strings
  const validNameParts = Object.entries(nameParts).filter(([key, value]) => 
    ['given_name', 'family_name', 'nickname', 'name'].includes(key) && typeof value === 'string' && value.trim() !== ''
  );

  if (validNameParts.length === 0) {
    return error(400, { 
      success: false, 
      error: 'Invalid request body. At least one valid name part (given_name, family_name, nickname, name) must be provided as a non-empty string.' 
    });
  }
  
  const validatedNameParts: NamePartsRequestBody = Object.fromEntries(validNameParts);

  try {
    const updatedUser: Auth0User = await userService.updateUserName(env, userId, validatedNameParts);
    return json({ success: true, message: 'User name updated successfully.', data: updatedUser });
  } catch (e: any) {
    console.error('Error in updateUserNameHandler calling userService:', e.message);
    // Check if the error message is one we threw from the service for Auth0 specific issues
    if (e.message.startsWith('Failed to update user name for') || e.message.startsWith('Network error') || e.message.startsWith('Auth0 Management API request failed')) {
        return error(502, { success: false, error: 'Failed to update user name with external provider.', details: e.message }); // 502 Bad Gateway
    }
    return error(500, { success: false, error: 'An unexpected error occurred while updating user name.', details: e.message });
  }
}

export async function sendForgotPasswordEmailHandler(request: AuthenticatedRequest, env: Env, ctx: ExecutionContext): Promise<Response> {
  const userService = new UserService();
  const userEmail = request.props?.user?.email;
  const userId = request.props?.user?.sub; // For logging or if needed by service in future

  if (!userId) {
    // This should ideally be caught by authenticationMiddleware if sub is always expected
    return error(401, { success: false, error: 'Unauthorized. User identifier not found.' });
  }

  if (!userEmail) {
    // If email is not present in the token (e.g. not configured in custom claims or scope)
    console.error(`User ${userId} attempted password reset, but email was not found in token props.`);
    return error(400, { success: false, error: 'User email not found in token. Cannot initiate password reset.' });
  }
  
  try {
    await userService.sendForgotPasswordEmail(env, userEmail);
    // Return a generic success message to prevent user enumeration
    return json({ success: true, message: `If an account exists for ${userEmail}, a password reset email has been sent.` });
  } catch (e: any) {
    console.error(`Error in sendForgotPasswordEmailHandler for user ${userId} (email: ${userEmail}):`, e.message);
    if (e.message.startsWith('Failed to request password reset for') || e.message.startsWith('Auth0 Management API request failed')) {
        return error(502, { success: false, error: 'Failed to initiate password reset with external provider.', details: e.message });
    }
    return error(500, { success: false, error: 'An unexpected error occurred while initiating password reset.', details: e.message });
  }
}

export async function deleteUserAccountHandler(request: AuthenticatedRequest, env: Env, ctx: ExecutionContext): Promise<Response> {
  const userService = new UserService();
  const userId = request.props?.user?.sub; 

  if (!userId) {
     return error(401, { success: false, error: 'Unauthorized. User ID not found.' });
  }

  try {
    await userService.deleteUserAccount(env, userId);
    // Typically, a DELETE operation that is successful returns a 204 No Content,
    // or a 200/202 if the deletion is asynchronous or needs further confirmation.
    // For simplicity and to provide some feedback, a 200 with a message is used here.
    // Consider 204 No Content if no body is preferred: return new Response(null, { status: 204 });
    return json({ success: true, message: `User account ${userId} has been successfully scheduled for deletion.` });
  } catch (e: any) {
    console.error(`Error in deleteUserAccountHandler for user ${userId}:`, e.message);
    if (e.message.startsWith('Failed to delete user account') || 
        e.message.startsWith('Auth0 Management API request failed') ||
        e.message.includes('user not found')) { // Auth0 might return this if already deleted or never existed
        // You might want to treat "user not found" as a success for idempotency, or a specific error.
        // For now, treating it as a failure from the provider.
        return error(502, { success: false, error: 'Failed to delete user account with external provider.', details: e.message });
    }
    return error(500, { success: false, error: 'An unexpected error occurred while deleting user account.', details: e.message });
  }
}
