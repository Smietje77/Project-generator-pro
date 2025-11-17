# API Documentation - Project Generator Pro

**Base URL:** `https://project.n8naccess.xyz/api`
**Local Development:** `http://localhost:4321/api`
**Authentication:** Cookie-based (`auth_token`)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Analysis](#analysis)
3. [Project Generation](#project-generation)
4. [GitHub Integration](#github-integration)
5. [Health Check](#health-check)
6. [Error Handling](#error-handling)

---

## Authentication

### POST /api/auth/login

Authenticate user with access code.

**Request:**
```json
{
  "code": "vibe2024"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Authentication successful"
}
```

**Response (401):**
```json
{
  "success": false,
  "error": "Invalid access code"
}
```

**Cookie Set:** `auth_token=authenticated` (7 days, httpOnly, sameSite: strict)

---

### POST /api/auth/logout

Clear authentication and logout.

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Cookie Cleared:** `auth_token`

---

### GET /api/auth/verify

Check if user is authenticated.

**Response (200):**
```json
{
  "authenticated": true
}
```

**No Authentication Required**

---

## Analysis

### POST /api/analyze

Analyze project configuration and recommend MCPs, agents, and tasks.

**Authentication:** Required

**Request:**
```json
{
  "name": "My SaaS App",
  "description": "A collaborative task management tool",
  "type": "saas",
  "features": [
    {
      "id": "auth",
      "name": "User Authentication",
      "category": "authentication",
      "required": true
    },
    {
      "id": "db",
      "name": "Database",
      "category": "database",
      "required": true
    }
  ],
  "techStack": {
    "frontend": ["React", "TypeScript"],
    "backend": ["Node.js", "Express"],
    "database": ["PostgreSQL"]
  },
  "metadata": {
    "createdAt": "2025-11-15T...",
    "estimatedComplexity": "moderate",
    "estimatedDuration": "2-4 weeks",
    "teamSize": 4
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "project": { /* ProjectConfig */ },
    "recommendedMCPs": [
      {
        "id": "desktop-commander",
        "name": "Desktop Commander",
        "description": "File operations and terminal access",
        "capabilities": ["file read/write", "terminal", "process management"],
        "useCases": ["Project scaffolding", "File creation"],
        "categories": ["filesystem"],
        "required": true
      },
      // ... more MCPs
    ],
    "requiredAgents": [
      {
        "id": "managing-agent",
        "name": "Managing Agent",
        "role": "Project Orchestrator",
        "responsibilities": ["Coordinate agents", "Make decisions"],
        "mcpAccess": ["desktop-commander", "github"],
        "collaboratesWith": ["frontend-agent", "backend-agent"],
        "priority": "critical"
      },
      // ... more agents
    ],
    "taskBreakdown": [
      {
        "id": "task-1",
        "title": "Initialize Project Structure",
        "description": "Create directories and initialize git",
        "assignedAgent": "managing-agent",
        "dependencies": [],
        "estimatedHours": 1,
        "priority": 1
      },
      // ... more tasks
    ],
    "collaborationProtocol": {
      "communicationChannels": ["Code comments", "Git commits"],
      "reviewProcess": ["Managing Agent reviews all"],
      "conflictResolution": ["Managing Agent decides"],
      "progressTracking": ["Daily commits"]
    }
  }
}
```

**Response (400):**
```json
{
  "success": false,
  "error": "Missing required fields: name, description, type"
}
```

**Response (401):**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

---

## Project Generation

### POST /api/generate

Generate complete project structure with files.

**Authentication:** Required

**Request:**
```json
{
  "config": {
    "name": "My SaaS App",
    "description": "A collaborative task management tool",
    "type": "saas",
    "features": [ /* ... */ ],
    "techStack": { /* ... */ },
    "metadata": { /* ... */ }
  },
  "customizations": {
    // Optional customizations from Step 3
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "projectPath": "C:\\claude_projects\\my-saas-app",
    "promptPath": "C:\\claude_projects\\my-saas-app\\.claude\\PROJECT_PROMPT.md",
    "sanitizedName": "my-saas-app",
    "fileOperations": [
      {
        "operation": "createDirectory",
        "path": "C:\\claude_projects\\my-saas-app"
      },
      {
        "operation": "writeFile",
        "path": "C:\\claude_projects\\my-saas-app\\README.md",
        "content": "...",
        "mode": "rewrite"
      },
      // ... more operations
    ],
    "analysis": {
      "totalAgents": 5,
      "totalMCPs": 3,
      "totalTasks": 12
    }
  }
}
```

**Note:** The `fileOperations` array contains all operations to be executed via Desktop Commander MCP. The client is responsible for executing these operations.

**Response (400):**
```json
{
  "success": false,
  "error": "Missing project configuration"
}
```

**Response (401):**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

---

## GitHub Integration

### POST /api/github-push

Create GitHub repository and prepare push operations.

**Authentication:** Required

**Request:**
```json
{
  "projectName": "My SaaS App",
  "sanitizedName": "my-saas-app",
  "projectPath": "C:\\claude_projects\\my-saas-app",
  "description": "A collaborative task management tool"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "repoName": "my-saas-app",
    "githubUrl": "https://github.com/Smietje77/my-saas-app",
    "cloneUrl": "https://github.com/Smietje77/my-saas-app.git",
    "githubOperations": {
      "createRepository": {
        "name": "my-saas-app",
        "private": true,
        "description": "...",
        "autoInit": false,
        "hasIssues": true,
        "hasProjects": false,
        "hasWiki": false
      },
      "gitCommands": [
        {
          "command": "git init",
          "cwd": "C:\\claude_projects\\my-saas-app",
          "description": "Initialize git repository"
        },
        // ... more commands
      ]
    },
    "message": "GitHub repository creation prepared. Execute operations to complete."
  }
}
```

**Note:** The client must execute the GitHub operations via GitHub MCP and Desktop Commander MCP.

**Response (400):**
```json
{
  "success": false,
  "error": "Missing required fields: sanitizedName, projectPath"
}
```

**Response (500):**
```json
{
  "success": false,
  "error": "GitHub token not configured. Please set GITHUB_TOKEN environment variable."
}
```

---

### GET /api/github-push/status

Check GitHub repository status.

**Authentication:** Required

**Query Parameters:**
- `repo`: Repository name (required)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "exists": false,
    "url": "https://github.com/Smietje77/my-saas-app",
    "message": "Use GitHub MCP to verify repository existence"
  }
}
```

---

## Health Check

### GET /api/health

Service health check endpoint.

**No Authentication Required**

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2025-11-15T10:30:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "service": "Project Generator Pro",
  "uptime": 3600,
  "checks": {
    "api": "operational",
    "auth": "operational",
    "mcp": "ready"
  }
}
```

**Response (503) - Degraded:**
```json
{
  "status": "degraded",
  "timestamp": "2025-11-15T10:30:00.000Z",
  "version": "1.0.0",
  "error": "Service degraded"
}
```

---

### HEAD /api/health

Lightweight health check (headers only, no body).

**No Authentication Required**

**Response:** 200 (no body)

---

## Error Handling

### Standard Error Response Format

All API endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE" // Optional error code
}
```

### HTTP Status Codes

- **200 OK** - Request successful
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Authentication required or invalid
- **403 Forbidden** - Authenticated but not permitted
- **404 Not Found** - Endpoint not found
- **500 Internal Server Error** - Server error
- **503 Service Unavailable** - Service degraded

### Common Error Codes

- `AUTH_REQUIRED` - Authentication required
- `INVALID_ACCESS_CODE` - Invalid access code provided
- `MISSING_FIELDS` - Required fields missing
- `INVALID_CONFIG` - Invalid project configuration
- `GITHUB_ERROR` - GitHub operation failed
- `FILE_OPERATION_ERROR` - File system operation failed

---

## Authentication Flow

1. **User visits site** → Frontend checks `/api/auth/verify`
2. **Not authenticated** → Show login modal
3. **User enters access code** → POST to `/api/auth/login`
4. **Authentication successful** → Cookie set, show wizard
5. **User completes wizard** → POST to `/api/analyze` → POST to `/api/generate` → POST to `/api/github-push`
6. **User logs out** → POST to `/api/auth/logout`

---

## MCP Integration Notes

### Desktop Commander MCP

The `/api/generate` endpoint returns `fileOperations` that should be executed via Desktop Commander MCP:

```typescript
// Example: Execute file operations
for (const op of fileOperations) {
  if (op.operation === 'createDirectory') {
    await desktopCommander.createDirectory({ path: op.path });
  } else if (op.operation === 'writeFile') {
    await desktopCommander.writeFile({
      path: op.path,
      content: op.content,
      mode: op.mode
    });
  }
}
```

### GitHub MCP

The `/api/github-push` endpoint returns `githubOperations` that should be executed via GitHub MCP:

```typescript
// Example: Create repository
const repo = await githubMCP.createRepository(
  githubOperations.createRepository
);

// Example: Execute git commands
for (const cmd of githubOperations.gitCommands) {
  await desktopCommander.startProcess({
    command: cmd.command,
    timeout_ms: 30000
  });
}
```

---

## Environment Variables

Required environment variables for API endpoints:

```bash
# Authentication
ACCESS_CODE=vibe2024

# GitHub Integration
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
GITHUB_USERNAME=Smietje77

# Optional
NODE_ENV=production
PUBLIC_URL=https://project.n8naccess.xyz
```

---

## Rate Limiting

Currently no rate limiting implemented. Consider adding in future:

- Login attempts: 5 per minute per IP
- Project generation: 10 per hour per user
- GitHub operations: 50 per hour per user

---

## CORS Configuration

API allows requests from:
- Same origin (https://project.n8naccess.xyz)
- Localhost during development

Configured in Astro middleware.

---

**Generated:** 2025-11-15
**Version:** 1.0.0
**Maintained by:** Backend Agent
