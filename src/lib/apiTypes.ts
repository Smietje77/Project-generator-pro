/**
 * API Type Definitions
 *
 * Type-safe definitions for all API endpoints
 * Use these types in frontend components for full TypeScript support
 */

import type { ProjectConfig, AnalysisResult } from './types';

// ============================================================================
// Base API Response Types
// ============================================================================

export interface APISuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface APIErrorResponse {
  success: false;
  error: string;
  code?: string;
}

export type APIResponse<T = unknown> = APISuccessResponse<T> | APIErrorResponse;

// ============================================================================
// Authentication API Types
// ============================================================================

export interface LoginRequest {
  code: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface LogoutResponse {
  success: boolean;
  message?: string;
}

export interface VerifyResponse {
  authenticated: boolean;
}

// ============================================================================
// Analysis API Types
// ============================================================================

export interface AnalyzeRequest {
  name: string;
  description: string;
  type: string;
  features?: any[];
  techStack?: any;
  metadata?: any;
}

export interface AnalyzeResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}

// ============================================================================
// Generate API Types
// ============================================================================

export interface GenerateRequest {
  config: ProjectConfig;
  customizations?: Record<string, any>;
}

export type FileOperation =
  | {
      operation: 'createDirectory';
      path: string;
    }
  | {
      operation: 'writeFile';
      path: string;
      content: string;
      mode: 'rewrite' | 'append';
    };

export interface GenerateResponseData {
  projectPath: string;
  promptPath: string;
  sanitizedName: string;
  fileOperations: FileOperation[];
  analysis: {
    totalAgents: number;
    totalMCPs: number;
    totalTasks: number;
  };
}

export interface GenerateResponse {
  success: boolean;
  data?: GenerateResponseData;
  error?: string;
}

// ============================================================================
// GitHub Push API Types
// ============================================================================

export interface GitHubPushRequest {
  projectName: string;
  sanitizedName: string;
  projectPath: string;
  description?: string;
}

export interface GitCommand {
  command: string;
  cwd: string;
  description: string;
  requiresAuth?: boolean;
  authToken?: string;
}

export interface GitHubOperations {
  createRepository: {
    name: string;
    private: boolean;
    description: string;
    autoInit: boolean;
    hasIssues: boolean;
    hasProjects: boolean;
    hasWiki: boolean;
  };
  gitCommands: GitCommand[];
}

export interface GitHubPushResponseData {
  repoName: string;
  githubUrl: string;
  cloneUrl: string;
  githubOperations: GitHubOperations;
  message: string;
}

export interface GitHubPushResponse {
  success: boolean;
  data?: GitHubPushResponseData;
  error?: string;
}

export interface GitHubStatusRequest {
  repo: string;
}

export interface GitHubStatusResponseData {
  exists: boolean;
  url: string;
  message: string;
}

export interface GitHubStatusResponse {
  success: boolean;
  data?: GitHubStatusResponseData;
  error?: string;
}

// ============================================================================
// Health Check API Types
// ============================================================================

export interface HealthCheckResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  version: string;
  environment?: string;
  service?: string;
  uptime?: number | null;
  checks?: {
    api: string;
    auth: string;
    mcp: string;
  };
  error?: string;
}

// ============================================================================
// Error Codes
// ============================================================================

export enum APIErrorCode {
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  INVALID_ACCESS_CODE = 'INVALID_ACCESS_CODE',
  MISSING_FIELDS = 'MISSING_FIELDS',
  INVALID_CONFIG = 'INVALID_CONFIG',
  GITHUB_ERROR = 'GITHUB_ERROR',
  FILE_OPERATION_ERROR = 'FILE_OPERATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if API response is successful
 */
export function isSuccessResponse<T>(
  response: APIResponse<T>
): response is APISuccessResponse<T> {
  return response.success === true;
}

/**
 * Type guard to check if API response is an error
 */
export function isErrorResponse(
  response: APIResponse<any>
): response is APIErrorResponse {
  return response.success === false;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Extract data type from successful API response
 */
export type ExtractAPIData<T extends APIResponse<any>> =
  T extends APISuccessResponse<infer D> ? D : never;

/**
 * API endpoint path type
 */
export type APIEndpoint =
  | '/api/auth/login'
  | '/api/auth/logout'
  | '/api/auth/verify'
  | '/api/analyze'
  | '/api/generate'
  | '/api/github-push'
  | '/api/github-push/status'
  | '/api/health';

/**
 * HTTP method type
 */
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD';

/**
 * API request configuration
 */
export interface APIRequestConfig {
  endpoint: APIEndpoint;
  method: HTTPMethod;
  body?: any;
  params?: Record<string, string>;
  headers?: Record<string, string>;
}
