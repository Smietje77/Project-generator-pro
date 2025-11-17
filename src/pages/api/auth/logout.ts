import type { APIRoute } from 'astro';

/**
 * POST /api/auth/logout
 *
 * Clears authentication cookie and logs out user
 *
 * Response:
 * - 200: { success: true }
 */
export const POST: APIRoute = async ({ cookies }) => {
  try {
    // Delete authentication cookie
    cookies.delete('auth_token', { path: '/' });

    return new Response(JSON.stringify({
      success: true,
      message: 'Logged out successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Logout error:', error);

    return new Response(JSON.stringify({
      success: false,
      error: 'Logout failed. Please try again.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
