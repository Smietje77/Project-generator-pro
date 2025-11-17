import type { APIRoute } from 'astro';

/**
 * GET /api/auth/verify
 *
 * Verifies if user is authenticated by checking auth cookie
 *
 * Response:
 * - 200: { authenticated: boolean }
 */
export const GET: APIRoute = async ({ cookies }) => {
  try {
    const authToken = cookies.get('auth_token');
    const isAuthenticated = authToken?.value === 'authenticated';

    return new Response(JSON.stringify({
      authenticated: isAuthenticated
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Verification error:', error);

    // On error, assume not authenticated
    return new Response(JSON.stringify({
      authenticated: false
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
