import type { APIRoute } from 'astro';

/**
 * POST /api/auth/login
 *
 * Authenticates user with access code and sets auth cookie
 *
 * Request Body:
 * - code: string (access code to verify)
 *
 * Response:
 * - 200: { success: true } with cookie set
 * - 401: { success: false, error: "Invalid access code" }
 * - 400: { success: false, error: "Missing access code" }
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { code } = body;

    // Validate request
    if (!code) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing access code'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get access code from environment (default: vibe2024)
    const ACCESS_CODE = import.meta.env.ACCESS_CODE || 'vibe2024';

    // Verify code (trim whitespace to be safe)
    if (code?.trim() === ACCESS_CODE.trim()) {
      // Set authentication cookie (7 days expiry)
      cookies.set('auth_token', 'authenticated', {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        sameSite: 'strict',
        secure: import.meta.env.PROD // Only secure in production
      });

      return new Response(JSON.stringify({
        success: true,
        message: 'Authentication successful'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Invalid code
    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid access code'
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Login error:', error);

    return new Response(JSON.stringify({
      success: false,
      error: 'Login failed. Please try again.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
