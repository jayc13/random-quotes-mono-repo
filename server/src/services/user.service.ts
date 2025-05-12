import { Env } from '../types/env.types';
import { Auth0Service } from './auth0.service';

// Define a more specific Auth0User type based on common user properties
// This should align with the fields you expect to receive from Auth0's /api/v2/users/{id} endpoint
export interface Auth0User {
  user_id: string; // The user's unique identifier.
  email?: string; // The user's email address.
  email_verified?: boolean; // Whether the user's email address is verified.
  username?: string; // The user's username. This is only available if you're using the username-password connection.
  phone_number?: string; // The user's phone number (following E.164 format).
  phone_verified?: boolean; // Whether the user's phone number is verified.
  created_at?: string; // The time the user was created.
  updated_at?: string; // The time the user was last updated.
  identities?: Array<object>; // An array of objects, each representing an identity linked to the user.
  app_metadata?: Record<string, any>; // User-specific metadata that cannot be set or modified by the user.
  user_metadata?: Record<string, any>; // User-specific metadata that can be set and modified by the user.
  picture?: string; // URL to the user's profile picture.
  name?: string; // The user's full name.
  nickname?: string; // The user's nickname.
  multifactor?: Array<string>; // List of multi-factor authentication providers with which the user is enrolled.
  last_ip?: string; // Last IP address from which the user logged in.
  last_login?: string; // Last time the user logged in.
  logins_count?: number; // Total number of times the user has logged in.
  blocked?: boolean; // Whether the user is blocked.
  given_name?: string; // The user's given name.
  family_name?: string; // The user's family name.
}

export class UserService {
  // No constructor needed if Auth0Service is instantiated per method call

  async updateUserName(env: Env, userId: string, nameParts: { given_name?: string, family_name?: string, nickname?: string, name?: string }): Promise<Auth0User> {
    const auth0Service = new Auth0Service(env);
    
    // Basic validation for nameParts
    if (!nameParts || Object.keys(nameParts).length === 0) {
      throw new Error('nameParts cannot be empty');
    }
    if (!userId) {
      throw new Error('userId cannot be empty');
    }

    try {
      const updatedUser = await auth0Service.request<Auth0User>(`users/${userId}`, 'PATCH', nameParts);
      return updatedUser;
    } catch (error: any) {
      console.error(`Error updating user ${userId} in Auth0:`, error.message);
      // Check if the error is from the fetch call itself (e.g. network issue)
      // or an error response from Auth0 (which auth0Service.request should handle by throwing an error)
      if (error.message.startsWith('Auth0 Management API request failed')) {
        // This is an error parsed from Auth0's response by auth0.service.ts
        throw error; 
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        // This could be a network error or an issue with the fetch call itself
        throw new Error(`Network error or fetch configuration issue while updating user: ${error.message}`);
      }
      // Re-throw a generic error or a custom error type if not already specific enough
      throw new Error(`Failed to update user name for ${userId}. Cause: ${error.message}`);
    }
  }

  async sendForgotPasswordEmail(env: Env, email: string): Promise<void> {
    const auth0Service = new Auth0Service(env);
    
    if (!email) {
      throw new Error('Email address is required to send a password reset email.');
    }

    const payload: {
      email: string;
      client_id: string;
      connection_id?: string;
      // result_url?: string; // Optional: URL to redirect to after password is changed. Configure in Auth0 dashboard.
      // ttl_sec?: number;    // Optional: Lifetime of the ticket in seconds. Defaults to 432000 (5 days).
    } = {
      email: email,
      client_id: env.AUTH0_CLIENT_ID, // The application's client_id
    };

    if (env.AUTH0_CONNECTION_ID) {
      payload.connection_id = env.AUTH0_CONNECTION_ID;
    } else {
      // If no specific connection_id is provided, Auth0 will attempt to determine the
      // connection based on the email domain or other configurations.
      // For basic username/password DBs, often 'Username-Password-Authentication'
      // but it's better to configure this if it's fixed.
      console.warn("AUTH0_CONNECTION_ID is not set. Auth0 will attempt to infer the connection for password reset.");
    }

    try {
      // The response from this endpoint is usually a 204 No Content or details about the ticket.
      // We don't need to return the ticket details to the client.
      await auth0Service.request<any>('tickets/password-change', 'POST', payload);
      console.log(`Password reset ticket request sent for email: ${email}`);
    } catch (error: any) {
      console.error(`Error requesting password reset ticket for ${email}:`, error.message);
      // Re-throw a more specific error or handle it as needed
      if (error.message.startsWith('Auth0 Management API request failed')) {
        throw error;
      }
      throw new Error(`Failed to request password reset for ${email}. Cause: ${error.message}`);
    }
  }

  async deleteUserAccount(env: Env, userId: string): Promise<void> {
    const auth0Service = new Auth0Service(env);

    if (!userId) {
      throw new Error('User ID is required to delete an account.');
    }

    // **Placeholder for application-specific data deletion**
    // Before deleting the user from Auth0, you would typically:
    // 1. Delete or anonymize user data from your application's own database (e.g., D1_DB).
    //    Example: await env.D1_DB.prepare("DELETE FROM UserApplicationData WHERE auth0_user_id = ?").bind(userId).run();
    // 2. Handle any cascading deletions or updates related to the user's data.
    // 3. Ensure this process is robust and handles potential errors.
    console.log(`Placeholder: Application-specific data deletion for user ${userId} would occur here.`);

    try {
      // Auth0's DELETE /api/v2/users/{id} endpoint returns a 204 No Content on success.
      await auth0Service.request<void>(`users/${userId}`, 'DELETE');
      console.log(`User account ${userId} deleted from Auth0 successfully.`);
    } catch (error: any) {
      console.error(`Error deleting user ${userId} from Auth0:`, error.message);
      if (error.message.startsWith('Auth0 Management API request failed')) {
        // Specific error from Auth0, e.g., user not found (which might be ok if already deleted)
        // or insufficient permissions for the M2M client.
        throw error; 
      }
      throw new Error(`Failed to delete user account ${userId} from Auth0. Cause: ${error.message}`);
    }
  }
}
