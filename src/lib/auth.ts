/**
 * Simple password-based authentication
 * Access code: vibe2024
 */

export const ACCESS_CODE = 'vibe2024';

/**
 * Verify access code
 */
export function verifyAccess(code: string): boolean {
  return code === ACCESS_CODE;
}

/**
 * Check if user is authenticated (from session/cookie)
 */
export function isAuthenticated(request: Request): boolean {
  const cookie = request.headers.get('cookie');
  if (!cookie) return false;
  
  const authCookie = cookie.split(';')
    .find(c => c.trim().startsWith('auth='));
  
  if (!authCookie) return false;
  
  const token = authCookie.split('=')[1];
  return token === ACCESS_CODE;
}

/**
 * Generate auth cookie header
 */
export function generateAuthCookie(): string {
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  return `auth=${ACCESS_CODE}; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=Strict`;
}

/**
 * Generate logout cookie header
 */
export function generateLogoutCookie(): string {
  return `auth=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict`;
}
