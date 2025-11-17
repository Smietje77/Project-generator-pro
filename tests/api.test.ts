/**
 * API Endpoints Test Suite
 *
 * Integration tests for all API endpoints
 * Run with: npm test
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type {
  LoginResponse,
  VerifyResponse,
  AnalyzeResponse,
  GenerateResponse,
  GitHubPushResponse,
  HealthCheckResponse
} from '../src/lib/apiTypes';

const BASE_URL = process.env.TEST_URL || 'http://localhost:4321';
const ACCESS_CODE = process.env.ACCESS_CODE || 'vibe2024';

/**
 * Helper function to make API requests
 */
async function makeRequest<T>(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  headers: Record<string, string> = {}
): Promise<{ status: number; data: T }> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include' // Include cookies
  });

  const data = await response.json();
  return { status: response.status, data };
}

describe('API Endpoints', () => {
  let authCookie: string = '';

  describe('Health Check', () => {
    it('GET /api/health should return service status', async () => {
      const { status, data } = await makeRequest<HealthCheckResponse>('/api/health');

      expect(status).toBe(200);
      expect(data.status).toBe('ok');
      expect(data.version).toBe('1.0.0');
      expect(data.service).toBe('Project Generator Pro');
    });

    it('HEAD /api/health should return 200 with no body', async () => {
      const response = await fetch(`${BASE_URL}/api/health`, { method: 'HEAD' });
      expect(response.status).toBe(200);
    });
  });

  describe('Authentication', () => {
    it('POST /api/auth/login should reject invalid code', async () => {
      const { status, data } = await makeRequest<LoginResponse>(
        '/api/auth/login',
        'POST',
        { code: 'wrong_code' }
      );

      expect(status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid access code');
    });

    it('POST /api/auth/login should accept valid code', async () => {
      const { status, data } = await makeRequest<LoginResponse>(
        '/api/auth/login',
        'POST',
        { code: ACCESS_CODE }
      );

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('successful');
    });

    it('GET /api/auth/verify should confirm authentication', async () => {
      const { status, data } = await makeRequest<VerifyResponse>('/api/auth/verify');

      expect(status).toBe(200);
      expect(data.authenticated).toBe(true);
    });

    it('POST /api/auth/logout should clear authentication', async () => {
      const { status, data } = await makeRequest<LoginResponse>(
        '/api/auth/logout',
        'POST'
      );

      expect(status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('GET /api/auth/verify should confirm logged out', async () => {
      const { status, data } = await makeRequest<VerifyResponse>('/api/auth/verify');

      expect(status).toBe(200);
      expect(data.authenticated).toBe(false);
    });
  });

  describe('Protected Endpoints (Require Auth)', () => {
    beforeAll(async () => {
      // Login before testing protected endpoints
      await makeRequest<LoginResponse>('/api/auth/login', 'POST', {
        code: ACCESS_CODE
      });
    });

    afterAll(async () => {
      // Logout after tests
      await makeRequest<LoginResponse>('/api/auth/logout', 'POST');
    });

    describe('Analysis', () => {
      it('POST /api/analyze should reject missing fields', async () => {
        const { status, data } = await makeRequest<AnalyzeResponse>(
          '/api/analyze',
          'POST',
          { name: 'Test' } // Missing description and type
        );

        expect(status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain('Missing required fields');
      });

      it('POST /api/analyze should analyze valid project', async () => {
        const { status, data } = await makeRequest<AnalyzeResponse>(
          '/api/analyze',
          'POST',
          {
            name: 'Test Project',
            description: 'A test project for API validation',
            type: 'saas',
            features: [
              {
                id: 'auth',
                name: 'Authentication',
                category: 'authentication',
                required: true
              }
            ],
            techStack: {
              frontend: ['React'],
              backend: ['Node.js']
            }
          }
        );

        expect(status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data).toBeDefined();
        expect(data.data?.recommendedMCPs).toBeDefined();
        expect(data.data?.requiredAgents).toBeDefined();
        expect(data.data?.taskBreakdown).toBeDefined();

        // Verify required MCPs are included
        const mcpIds = data.data?.recommendedMCPs.map(m => m.id) || [];
        expect(mcpIds).toContain('desktop-commander');
        expect(mcpIds).toContain('github');

        // Verify managing agent is included
        const agentIds = data.data?.requiredAgents.map(a => a.id) || [];
        expect(agentIds).toContain('managing-agent');
      });
    });

    describe('Generation', () => {
      it('POST /api/generate should reject invalid config', async () => {
        const { status, data } = await makeRequest<GenerateResponse>(
          '/api/generate',
          'POST',
          { config: null }
        );

        expect(status).toBe(400);
        expect(data.success).toBe(false);
      });

      it('POST /api/generate should generate project structure', async () => {
        const { status, data } = await makeRequest<GenerateResponse>(
          '/api/generate',
          'POST',
          {
            config: {
              name: 'Test API Project',
              description: 'API endpoint test project',
              type: 'api',
              features: [],
              techStack: {},
              metadata: {
                createdAt: new Date(),
                estimatedComplexity: 'simple',
                estimatedDuration: '1 week',
                teamSize: 2
              }
            }
          }
        );

        expect(status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data).toBeDefined();
        expect(data.data?.projectPath).toBeDefined();
        expect(data.data?.promptPath).toBeDefined();
        expect(data.data?.sanitizedName).toBe('test-api-project');
        expect(data.data?.fileOperations).toBeDefined();
        expect(data.data?.fileOperations.length).toBeGreaterThan(0);

        // Verify file operations structure
        const createDirOps = data.data?.fileOperations.filter(
          op => op.operation === 'createDirectory'
        );
        const writeFileOps = data.data?.fileOperations.filter(
          op => op.operation === 'writeFile'
        );

        expect(createDirOps?.length).toBeGreaterThan(0);
        expect(writeFileOps?.length).toBeGreaterThan(0);
      });
    });

    describe('GitHub Push', () => {
      it('POST /api/github-push should reject missing fields', async () => {
        const { status, data } = await makeRequest<GitHubPushResponse>(
          '/api/github-push',
          'POST',
          { projectName: 'Test' } // Missing sanitizedName and projectPath
        );

        expect(status).toBe(400);
        expect(data.success).toBe(false);
      });

      it('POST /api/github-push should prepare GitHub operations', async () => {
        const { status, data } = await makeRequest<GitHubPushResponse>(
          '/api/github-push',
          'POST',
          {
            projectName: 'Test GitHub Project',
            sanitizedName: 'test-github-project',
            projectPath: 'C:\\claude_projects\\test-github-project',
            description: 'Test GitHub integration'
          }
        );

        // May fail if GITHUB_TOKEN not set, but should still return structured response
        if (status === 200) {
          expect(data.success).toBe(true);
          expect(data.data?.repoName).toBe('test-github-project');
          expect(data.data?.githubUrl).toContain('github.com');
          expect(data.data?.githubOperations).toBeDefined();
          expect(data.data?.githubOperations.gitCommands).toBeDefined();
        } else {
          expect(status).toBe(500);
          expect(data.error).toContain('token');
        }
      });

      it('GET /api/github-push/status should check repo status', async () => {
        const { status, data } = await makeRequest<any>(
          '/api/github-push/status?repo=test-repo'
        );

        expect(status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data?.url).toContain('github.com');
      });
    });
  });

  describe('Middleware Protection', () => {
    beforeAll(async () => {
      // Ensure logged out
      await makeRequest<LoginResponse>('/api/auth/logout', 'POST');
    });

    it('Protected endpoints should return 401 when not authenticated', async () => {
      const endpoints = ['/api/analyze', '/api/generate', '/api/github-push'];

      for (const endpoint of endpoints) {
        const { status, data } = await makeRequest(endpoint, 'POST', {});

        expect(status).toBe(401);
        expect(data.success).toBe(false);
        expect(data.error).toContain('Unauthorized');
      }
    });

    it('Public endpoints should work without authentication', async () => {
      const publicEndpoints = [
        { endpoint: '/api/auth/verify', method: 'GET' },
        { endpoint: '/api/health', method: 'GET' }
      ];

      for (const { endpoint, method } of publicEndpoints) {
        const response = await fetch(`${BASE_URL}${endpoint}`, { method });
        expect(response.status).toBe(200);
      }
    });
  });
});

describe('Error Handling', () => {
  it('Non-existent endpoints should return 404', async () => {
    const response = await fetch(`${BASE_URL}/api/non-existent`);
    expect(response.status).toBe(404);
  });

  it('Invalid JSON should return 400', async () => {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json'
    });

    expect(response.status).toBe(400);
  });

  it('Invalid HTTP method should return 405', async () => {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'DELETE' // Login only accepts POST
    });

    // Astro may return 404 or 405 depending on routing
    expect([404, 405]).toContain(response.status);
  });
});
