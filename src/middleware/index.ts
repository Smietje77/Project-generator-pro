import { defineMiddleware } from 'astro:middleware';

/**
 * Authentication Middleware
 *
 * Protects API routes from unauthorized access
 * Public routes: /api/auth/*, /api/health
 * All other /api/* routes require authentication
 */
export const onRequest = defineMiddleware(async ({ cookies, url, request }, next) => {
  // Only check API routes
  if (!url.pathname.startsWith('/api/')) {
    return next();
  }

  // Define public routes (no auth required)
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/logout',
    '/api/auth/verify',
    '/api/health'
  ];

  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => url.pathname.startsWith(route));

  if (isPublicRoute) {
    // Allow public routes without authentication
    return next();
  }

  // For protected routes, verify authentication
  const authToken = cookies.get('auth_token');

  if (authToken?.value !== 'authenticated') {
    // Return 401 Unauthorized for unauthenticated API requests
    return new Response(JSON.stringify({
      success: false,
      error: 'Unauthorized. Please login first.',
      code: 'AUTH_REQUIRED'
    }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'Cookie'
      }
    });
  }

  // User is authenticated, proceed to the API route
  return next();
});
