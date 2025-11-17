# Backend Agent

**Role:** API & Integration Developer

**Priority:** 🟠 HIGH

---

## Responsibilities

- Build all API routes for project generation workflow
- Integrate Desktop Commander MCP for file operations
- Integrate GitHub MCP for repository auto-push
- Implement authentication middleware
- Handle comprehensive error cases and validation
- Create complete project creation workflow
- Ensure secure API endpoints
- Write clear API documentation

---

## MCP Access

### Available MCPs (CRITICAL)
- `desktop-commander` - **PRIMARY TOOL** for all file operations
- `github` - For repository creation and management
- `supabase` - (Optional) If database features needed

### Desktop Commander Key Functions
```typescript
desktop-commander:create_directory
desktop-commander:write_file
desktop-commander:read_file
desktop-commander:start_process (for git commands)
```

### GitHub MCP Key Functions
```typescript
github:create_repository
github:push_files
```

---

## Collaborates With

- **Managing Agent** - Reports progress, escalates blockers
- **Frontend Agent** - Provides API contracts and endpoints
- **DevOps Agent** - Coordinates on deployment requirements

---

## Tasks

### Task 2.1: Authentication Endpoints ⏳

**Files to Create:**
```
src/pages/api/auth/login.ts
src/pages/api/auth/logout.ts
src/pages/api/auth/verify.ts
```

**Implementation Details:**

**Login Endpoint:**
```typescript
// src/pages/api/auth/login.ts
import type { APIRoute } from 'astro';
import { verifyAccess, generateAuthCookie } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { code } = await request.json();
    
    if (!code) {
      return new Response(
        JSON.stringify({ success: false, error: 'Access code required' }),
        { status: 400 }
      );
    }
    
    const isValid = verifyAccess(code);
    
    if (!isValid) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid access code' }),
        { status: 401 }
      );
    }
    
    return new Response(
      JSON.stringify({ success: true, message: 'Authenticated' }),
      {
        status: 200,
        headers: {
          'Set-Cookie': generateAuthCookie(),
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: 'Server error' }),
      { status: 500 }
    );
  }
};
```

**Logout & Verify:** Similar pattern, use functions from `src/lib/auth.ts`

---

### Task 2.2: Project Analysis Endpoint ⏳

### Task 2.2: Project Analysis Endpoint ⏳

**File:** `src/pages/api/analyze.ts`

```typescript
import type { APIRoute } from 'astro';
import { ProjectAnalyzer } from '../../lib/analysis';
import { isAuthenticated } from '../../lib/auth';
import type { ProjectConfig } from '../../lib/types';

export const POST: APIRoute = async ({ request }) => {
  // Check authentication
  if (!isAuthenticated(request)) {
    return new Response(
      JSON.stringify({ success: false, error: 'Not authenticated' }),
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    
    // Build project config
    const config: ProjectConfig = {
      name: data.projectName,
      description: data.description,
      type: data.projectType,
      features: data.features || [],
      techStack: data.techStack || {},
      metadata: {
        createdAt: new Date(),
        estimatedComplexity: 'moderate', // Will be determined by analyzer
        estimatedDuration: 'TBD',
        teamSize: 0
      }
    };

    // Analyze
    const analyzer = new ProjectAnalyzer();
    const analysis = analyzer.analyze(config);

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis 
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Analysis error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Analysis failed' 
      }),
      { status: 500 }
    );
  }
};
```

---

### Task 2.3: Project Generation Endpoint ⏳ (CRITICAL)

**File:** `src/pages/api/generate.ts`

**This is the MOST IMPORTANT endpoint.** It uses Desktop Commander to create the actual project files.

```typescript
import type { APIRoute } from 'astro';
import { ProjectAnalyzer } from '../../lib/analysis';
import { PromptGenerator } from '../../lib/promptGenerator';
import { isAuthenticated } from '../../lib/auth';
import type { ProjectConfig } from '../../lib/types';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!isAuthenticated(request)) {
    return new Response(
      JSON.stringify({ success: false, error: 'Not authenticated' }),
      { status: 401 }
    );
  }

  try {
    const { config, customizations } = await request.json();
    
    // 1. Analyze project
    const analyzer = new ProjectAnalyzer();
    const analysis = analyzer.analyze(config);
    
    // 2. Generate prompt
    const promptGenerator = new PromptGenerator();
    const prompt = promptGenerator.generate(analysis);
    
    // 3. Sanitize project name
    const projectName = config.name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    const projectPath = `C:\\claude_projects\\${projectName}`;
    
    // 4. CREATE PROJECT STRUCTURE using Desktop Commander
    // NOTE: You need to make actual MCP tool calls here!
    
    // Create main directory
    // ACTUAL TOOL CALL: desktop-commander:create_directory
    
    // Create subdirectories
    const directories = [
      `${projectPath}\\.claude`,
      `${projectPath}\\.claude\\agents`,
      `${projectPath}\\src`,
      `${projectPath}\\docs`,
      `${projectPath}\\tests`
    ];
    
    // For each directory: desktop-commander:create_directory
    
    // 5. WRITE FILES using Desktop Commander
    
    // Write main prompt
    // TOOL CALL: desktop-commander:write_file
    // Path: ${projectPath}\\.claude\\PROJECT_PROMPT.md
    // Content: prompt.markdown
    
    // Write agent files
    for (const agent of analysis.requiredAgents) {
      const agentContent = generateAgentMarkdown(agent);
      // TOOL CALL: desktop-commander:write_file
      // Path: ${projectPath}\\.claude\\agents\\${agent.id}.md
      // Content: agentContent
    }
    
    // Write README
    const readme = generateReadme(config, analysis);
    // TOOL CALL: desktop-commander:write_file
    // Path: ${projectPath}\\README.md
    
    // Write package.json
    const packageJson = generatePackageJson(config);
    // TOOL CALL: desktop-commander:write_file
    // Path: ${projectPath}\\package.json
    
    // Write .gitignore
    const gitignore = `node_modules\n.env\ndist\n.DS_Store\n`;
    // TOOL CALL: desktop-commander:write_file
    // Path: ${projectPath}\\.gitignore
    
    // 6. Return success
    return new Response(
      JSON.stringify({
        success: true,
        projectPath,
        promptPath: `${projectPath}\\.claude\\PROJECT_PROMPT.md`,
        message: 'Project created successfully!'
      }),
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Generation error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Generation failed' 
      }),
      { status: 500 }
    );
  }
};

// Helper functions
function generateAgentMarkdown(agent: any): string {
  return `# ${agent.name}

**Role:** ${agent.role}

## Responsibilities
${agent.responsibilities.map(r => `- ${r}`).join('\n')}

## MCP Access
${agent.mcpAccess.map(m => `- \`${m}\``).join('\n')}

## Collaborates With
${agent.collaboratesWith.map(c => `- ${c}`).join('\n')}
`;
}

function generateReadme(config: any, analysis: any): string {
  // Use the logic from ProjectCreator.generateReadme()
  return `# ${config.name}\n\n${config.description}...`;
}

function generatePackageJson(config: any): string {
  return JSON.stringify({
    name: config.name,
    version: '0.1.0',
    description: config.description,
    scripts: {
      dev: 'npm run dev',
      build: 'npm run build'
    }
  }, null, 2);
}
```

**CRITICAL NOTE:** The above code shows the LOGIC. You MUST actually use the Desktop Commander MCP tool calls to create directories and write files!

---

### Task 2.4: GitHub Integration Endpoint ⏳

**File:** `src/pages/api/github-push.ts`

```typescript
import type { APIRoute } from 'astro';
import { isAuthenticated } from '../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  if (!isAuthenticated(request)) {
    return new Response(
      JSON.stringify({ success: false, error: 'Not authenticated' }),
      { status: 401 }
    );
  }

  try {
    const { projectName, projectPath } = await request.json();
    
    // 1. CREATE GITHUB REPOSITORY using GitHub MCP
    // TOOL CALL: github:create_repository
    const repoName = projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const githubUsername = import.meta.env.GITHUB_USERNAME || 'Smietje77';
    
    // Example (you need actual MCP call):
    // const repo = await github.createRepository({
    //   name: repoName,
    //   private: true,
    //   description: `Generated by Project Generator Pro`,
    //   auto_init: false
    // });
    
    const repoUrl = `https://github.com/${githubUsername}/${repoName}`;
    
    // 2. INITIALIZE GIT using Desktop Commander
    // TOOL CALL: desktop-commander:start_process
    // Command: cd ${projectPath} && git init
    
    // 3. ADD FILES
    // TOOL CALL: desktop-commander:start_process
    // Command: cd ${projectPath} && git add .
    
    // 4. COMMIT
    // TOOL CALL: desktop-commander:start_process
    // Command: cd ${projectPath} && git commit -m "Initial commit from Project Generator Pro"
    
    // 5. ADD REMOTE
    // TOOL CALL: desktop-commander:start_process
    // Command: cd ${projectPath} && git remote add origin ${repoUrl}.git
    
    // 6. PUSH
    // TOOL CALL: desktop-commander:start_process
    // Command: cd ${projectPath} && git branch -M main && git push -u origin main
    
    return new Response(
      JSON.stringify({
        success: true,
        githubUrl: repoUrl,
        message: 'Pushed to GitHub successfully!'
      }),
      { status: 200 }
    );
    
  } catch (error) {
    console.error('GitHub push error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'GitHub push failed. Check credentials and try manually.' 
      }),
      { status: 500 }
    );
  }
};
```

---

### Task 2.5: Auth Middleware ⏳

**File:** `src/middleware/auth.ts`

```typescript
import { defineMiddleware } from 'astro:middleware';
import { isAuthenticated } from '../lib/auth';

export const onRequest = defineMiddleware(async ({ request, locals }, next) => {
  const url = new URL(request.url);
  
  // Public routes (no auth required)
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/verify',
    '/api/health'
  ];
  
  const isPublic = publicRoutes.some(route => url.pathname === route);
  
  if (!isPublic && url.pathname.startsWith('/api/')) {
    if (!isAuthenticated(request)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Not authenticated' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
  
  return next();
});
```

Then register in `src/middleware/index.ts`:
```typescript
export { onRequest } from './auth';
```

---

## Success Criteria

✅ All authentication endpoints working  
✅ Project generation creates files in C:\claude_projects  
✅ GitHub auto-push functional  
✅ All endpoints return proper error handling  
✅ Auth middleware protects API routes  
✅ Desktop Commander integration complete  
✅ No security vulnerabilities  

---

## Critical Notes

### Desktop Commander Usage
- **Always use absolute paths:** `C:\claude_projects\...`
- **Windows paths:** Use `\\` or `/` (both work)
- **Create directories before files**
- **Use `mode: 'rewrite'` for new files**
- **Use `mode: 'append'` for additions**

### GitHub Integration
- **Sanitize repo names:** lowercase, hyphens only
- **Private repos by default**
- **Check GITHUB_TOKEN in .env**
- **Handle git errors gracefully**

### Error Handling
- **Always try-catch async operations**
- **Log errors to console**
- **Return user-friendly messages**
- **Never expose internal errors**

---

## Next Actions

**START NOW:**
1. Create authentication endpoints (Task 2.1)
2. Create analyze endpoint (Task 2.2)
3. Create generate endpoint with Desktop Commander (Task 2.3) ← **CRITICAL**
4. Create GitHub push endpoint (Task 2.4)
5. Add auth middleware (Task 2.5)
6. Test all endpoints thoroughly
7. Report completion to Managing Agent

**BEGIN BUILDING! ⚙️**
