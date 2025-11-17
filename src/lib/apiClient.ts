/**
 * API Client Utility
 *
 * Type-safe API client for making requests to backend endpoints
 * Use this in frontend components instead of raw fetch calls
 */

import type {
  APIResponse,
  APIEndpoint,
  HTTPMethod,
  LoginRequest,
  LoginResponse,
  VerifyResponse,
  AnalyzeRequest,
  AnalyzeResponse,
  GenerateRequest,
  GenerateResponse,
  GitHubPushRequest,
  GitHubPushResponse,
  GitHubStatusResponse,
  HealthCheckResponse
} from './apiTypes';

/**
 * Base API request function
 */
async function apiRequest<TResponse = any>(
  endpoint: APIEndpoint | string,
  method: HTTPMethod = 'GET',
  body?: any,
  params?: Record<string, string>
): Promise<TResponse> {
  // Build URL with query parameters
  let url = endpoint;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  // Configure request
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'same-origin' // Include cookies
  };

  // Add body for POST/PUT/PATCH
  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    config.body = JSON.stringify(body);
  }

  // Make request
  const response = await fetch(url, config);

  // Parse JSON response
  const data = await response.json();

  // Throw on non-2xx responses
  if (!response.ok) {
    throw new APIError(
      data.error || `API request failed: ${response.status}`,
      response.status,
      data.code
    );
  }

  return data;
}

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Authentication API
 */
export const authAPI = {
  /**
   * Login with access code
   */
  async login(code: string): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/api/auth/login', 'POST', { code });
  },

  /**
   * Logout
   */
  async logout(): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/api/auth/logout', 'POST');
  },

  /**
   * Verify authentication status
   */
  async verify(): Promise<VerifyResponse> {
    return apiRequest<VerifyResponse>('/api/auth/verify', 'GET');
  }
};

/**
 * Analysis API
 */
export const analysisAPI = {
  /**
   * Analyze project configuration
   */
  async analyze(data: AnalyzeRequest): Promise<AnalyzeResponse> {
    return apiRequest<AnalyzeResponse>('/api/analyze', 'POST', data);
  }
};

/**
 * Generation API
 */
export const generationAPI = {
  /**
   * Generate project structure
   */
  async generate(data: GenerateRequest): Promise<GenerateResponse> {
    return apiRequest<GenerateResponse>('/api/generate', 'POST', data);
  }
};

/**
 * GitHub API
 */
export const githubAPI = {
  /**
   * Push project to GitHub
   */
  async push(data: GitHubPushRequest): Promise<GitHubPushResponse> {
    return apiRequest<GitHubPushResponse>('/api/github-push', 'POST', data);
  },

  /**
   * Check repository status
   */
  async status(repo: string): Promise<GitHubStatusResponse> {
    return apiRequest<GitHubStatusResponse>(
      '/api/github-push/status',
      'GET',
      undefined,
      { repo }
    );
  }
};

/**
 * Health Check API
 */
export const healthAPI = {
  /**
   * Get service health status
   */
  async check(): Promise<HealthCheckResponse> {
    return apiRequest<HealthCheckResponse>('/api/health', 'GET');
  }
};

/**
 * Combined API client
 */
export const api = {
  auth: authAPI,
  analysis: analysisAPI,
  generation: generationAPI,
  github: githubAPI,
  health: healthAPI
};

/**
 * Hook-style API client for use in components
 */
export function useAPI() {
  return api;
}

// Export default
export default api;
