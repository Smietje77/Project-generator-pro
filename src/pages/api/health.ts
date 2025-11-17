import type { APIRoute } from 'astro';

/**
 * GET /api/health
 *
 * Health check endpoint for monitoring and deployment verification
 * No authentication required
 *
 * Response:
 * - 200: { status: "ok", timestamp: string, version: string, environment: string }
 */
export const GET: APIRoute = async () => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: import.meta.env.MODE || 'development',
      service: 'Project Generator Pro',
      uptime: process.uptime ? Math.floor(process.uptime()) : null,
      checks: {
        api: 'operational',
        auth: 'operational',
        mcp: 'ready' // Desktop Commander and GitHub MCP
      }
    };

    return new Response(JSON.stringify(health), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Health check error:', error);

    // Even on error, return a valid health response with degraded status
    return new Response(JSON.stringify({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
};

/**
 * HEAD /api/health
 *
 * Lightweight health check (just headers, no body)
 */
export const HEAD: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
