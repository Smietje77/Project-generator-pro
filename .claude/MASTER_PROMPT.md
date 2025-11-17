# 🚀 PROJECT GENERATOR PRO - CLAUDE CODE MASTER PROMPT

**Generated:** 2025-11-15  
**Project Path:** C:\claude_projects\project-generator-pro  
**Deployment:** project.n8naccess.xyz (Dokploy)  
**Access Code:** vibe2024

---

## 📋 PROJECT CONTEXT

### What This Tool Does
An AI-powered project scaffolding tool that:
1. Takes user descriptions via 4-step wizard
2. Analyzes requirements → Matches MCP servers
3. Generates specialized AI agents (Managing Agent + team)
4. Creates complete Claude Code prompt
5. Auto-creates project structure in C:\claude_projects
6. Pushes to GitHub automatically

### Current Status (70% Complete)
**DONE:** Types, MCP Database, Analysis Engine, Prompt Generator, Auth, Configs  
**TODO:** Main page, Wizard UI, API routes, Desktop Commander integration, GitHub push

---

## 🔧 AVAILABLE MCP SERVERS

### 1️⃣ desktop-commander (REQUIRED)
**Purpose:** File operations, terminal, process management  
**Capabilities:**
- File read/write/edit operations
- Directory creation and management
- File search (content & names)
- Terminal command execution
- Interactive REPL sessions (Python, Node)

**Used For:**
- Creating project files in C:\claude_projects
- Writing agent definitions
- Generating project structure
- Running build commands

### 2️⃣ github (REQUIRED)
**Purpose:** GitHub repository management  
**Capabilities:**
- Create/manage repositories
- File operations (CRUD)
- Branch management
- Push commits
- Issue tracking

**Used For:**
- Auto-create repo for generated project
- Push initial commit
- Setup GitHub Actions (optional)

### 3️⃣ supabase (OPTIONAL)
**Purpose:** Database & backend services  
**When to use:** Projects with database needs

### 4️⃣ chrome-devtools (OPTIONAL)
**Purpose:** Browser automation & testing  
**When to use:** Web scraping, E2E testing

### 5️⃣ n8n (OPTIONAL)
**Purpose:** Workflow automation  
**When to use:** Integration & automation needs

---

## 🤖 AI AGENTS SYSTEM

### How Agents Work in This Project

### How Agents Work in This Project
- **This tool GENERATES agent definitions** for user projects
- Each generated project gets its own set of agents
- Agents are written as markdown files in `.claude/agents/`
- Each agent has: Role, Responsibilities, MCP Access, Collaborates With

### Agent Template Structure
```markdown
# [Agent Name]

**Role:** [Clear role description]

**Priority:** 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low

## Responsibilities
- [Specific task 1]
- [Specific task 2]
...

## MCP Access
- `desktop-commander`
- `github`
...

## Collaborates With
- managing-agent
- [other agents]

## Success Criteria
- [Measurable outcome 1]
- [Measurable outcome 2]
```

---

## 👥 AGENTS FOR THIS DEVELOPMENT

### 🎯 Managing Agent (YOU - Critical Priority)
**Role:** Project Orchestrator & Technical Lead

**Responsibilities:**
- Coordinate Frontend, Backend, and DevOps agents
- Make architectural decisions
- Ensure code quality and consistency
- Resolve conflicts between agents
- Track progress on all TODO items
- Final review before deployment

**MCP Access:** ALL (desktop-commander, github, context7)

**Success Criteria:**
- All 30% TODO items completed
- Project runs locally without errors
- Successfully deployed to Dokploy
- All authentication works
- GitHub integration functional

---

### 🎨 Frontend Agent (High Priority)
**Role:** UI/UX Developer

**Responsibilities:**
- Build 4-step wizard interface
- Create reusable UI components
- Implement responsive design with Tailwind
- Handle form validation and state management
- Create intuitive user experience
- Ensure accessibility standards

**MCP Access:** desktop-commander, github, chrome-devtools

**Key Files to Create:**

**Key Files to Create:**
```
src/pages/index.astro           # Main landing/wizard page
src/components/Step2.astro      # Features selection
src/components/Step3.astro      # Review generated config
src/components/Step4.astro      # Generate & deploy
src/components/ui/Button.astro
src/components/ui/Input.astro
src/components/ui/Select.astro
src/components/ui/Card.astro
src/components/ui/Spinner.astro
src/components/ui/Alert.astro
```

**Collaborates With:** Managing Agent, Backend Agent

---

### ⚙️ Backend Agent (High Priority)
**Role:** API & Integration Developer

**Responsibilities:**
- Build API routes for project generation
- Integrate Desktop Commander for file operations
- Integrate GitHub MCP for auto-push
- Implement authentication middleware
- Handle error cases and validation
- Create project creation workflow

**MCP Access:** desktop-commander, github

**Key Files to Create:**
```
src/pages/api/auth/login.ts      # POST - Verify access code
src/pages/api/auth/logout.ts     # POST - Clear session
src/pages/api/analyze.ts         # POST - Analyze project description
src/pages/api/generate.ts        # POST - Generate prompt & create project
src/pages/api/github-push.ts     # POST - Push to GitHub
src/middleware/auth.ts           # Auth middleware for API routes
```

**Collaborates With:** Managing Agent, DevOps Agent

---

### 🚀 DevOps Agent (Medium Priority)
**Role:** Deployment & Infrastructure

**Responsibilities:**
- Prepare production build configuration
- Create Dokploy deployment guide
- Setup environment variables
- Test production build
- Document deployment process
- Create health check endpoint

**MCP Access:** desktop-commander, github

**Key Files to Create:**
```
.github/workflows/deploy.yml    # Optional CI/CD
DEPLOYMENT.md                    # Dokploy deployment guide
src/pages/api/health.ts         # Health check endpoint
```

**Collaborates With:** Managing Agent

---

## 📊 TASK BREAKDOWN

### Phase 1: UI Components (Frontend Agent)
**Priority:** 🔴 CRITICAL

**Task 1.1:** Create Base UI Components Library

**Task 1.1:** Create Base UI Components Library
```typescript
// src/components/ui/Button.astro
- Primary, Secondary, Danger variants
- Loading state with spinner
- Disabled state
- Full width option

// src/components/ui/Input.astro
- Text, password, email types
- Label and error message support
- Validation state styling

// src/components/ui/Select.astro
- Single select dropdown
- Multiple select option
- Search functionality

// src/components/ui/Card.astro
- Container with shadow
- Header, body, footer slots

// src/components/ui/Alert.astro
- Success, Error, Warning, Info types
- Dismissible option

// src/components/ui/Spinner.astro
- Loading indicator
- Size variants
```

**Task 1.2:** Build Main Landing Page
```astro
// src/pages/index.astro
- Hero section with tool description
- Login modal (access code: vibe2024)
- Start wizard button
- Check authentication on load
- If authenticated → show wizard
- If not → show login modal
```

**Task 1.3:** Create Wizard Steps
```astro
// src/components/Step1.astro (ALREADY EXISTS - ENHANCE)
- Project name input (required)
- Description textarea (required)
- Project type select (saas, website, api, etc.)
- Next button

// src/components/Step2.astro
- Features multi-select checklist
- Tech stack preferences (frontend, backend, database)
- Additional requirements textarea
- Previous/Next buttons

// src/components/Step3.astro
- Display recommended MCPs with descriptions
- Display generated agents with roles
- Display task breakdown preview
- Allow minor customizations
- Generate button

// src/components/Step4.astro
- Show generation progress
- Display generated prompt (read-only)
- Show project path
- GitHub repository link (once pushed)
- Download ZIP button
- Start Over button
```

---

### Phase 2: API Routes (Backend Agent)
**Priority:** 🔴 CRITICAL

**Task 2.1:** Authentication Endpoints

**Task 2.1:** Authentication Endpoints
```typescript
// src/pages/api/auth/login.ts
POST /api/auth/login
Body: { code: string }
- Verify code against ACCESS_CODE (vibe2024)
- If valid: Set auth cookie, return { success: true }
- If invalid: Return { success: false, error: "Invalid code" }

// src/pages/api/auth/logout.ts
POST /api/auth/logout
- Clear auth cookie
- Return { success: true }

// src/pages/api/auth/verify.ts
GET /api/auth/verify
- Check if auth cookie exists and valid
- Return { authenticated: boolean }
```

**Task 2.2:** Project Analysis Endpoint
```typescript
// src/pages/api/analyze.ts
POST /api/analyze
Body: { 
  projectName: string
  description: string
  projectType: string
}
- Use ProjectAnalyzer to analyze
- Optionally use claudeClient for enhanced suggestions
- Return: {
    success: true,
    analysis: AnalysisResult
  }
```

**Task 2.3:** Project Generation Endpoint (CRITICAL)
```typescript
// src/pages/api/generate.ts
POST /api/generate
Body: {
  config: ProjectConfig
  step3Customizations: any
}

Workflow:
1. Use ProjectAnalyzer to get analysis
2. Use PromptGenerator to create prompt
3. Use Desktop Commander MCP to:
   - Create directory: C:\claude_projects\[project-name]
   - Create subdirectories: .claude, .claude/agents, src, docs, etc.
   - Write PROJECT_PROMPT.md to .claude/
   - Write agent files to .claude/agents/[agent-id].md
   - Write MCP config to .claude/mcp-config.json
   - Write README.md
   - Write package.json skeleton
   - Write .gitignore
4. Return: {
    success: true,
    projectPath: string,
    promptPath: string
  }

IMPORTANT: Use Desktop Commander tool calls:
- desktop-commander:create_directory
- desktop-commander:write_file
```

**Task 2.4:** GitHub Integration Endpoint

**Task 2.4:** GitHub Integration Endpoint
```typescript
// src/pages/api/github-push.ts
POST /api/github-push
Body: {
  projectName: string
  projectPath: string
}

Workflow:
1. Use GitHub MCP to create repository
   - Name: project name (sanitized)
   - Private: true
   - Initialize: false (we already have files)
   
2. Use Desktop Commander to:
   - Run: git init
   - Run: git add .
   - Run: git commit -m "Initial commit from Project Generator Pro"
   - Run: git remote add origin [github-url]
   - Run: git push -u origin main

3. Return: {
    success: true,
    githubUrl: string
  }

IMPORTANT: Use GitHub MCP tool calls:
- github:create_repository
- desktop-commander:start_process (for git commands)
```

**Task 2.5:** Auth Middleware
```typescript
// src/middleware/auth.ts
- Check auth cookie on API routes
- Return 401 if not authenticated
- Allow public routes: /api/auth/*
```

---

### Phase 3: Integration & Testing (Managing Agent)
**Priority:** 🟠 HIGH

**Task 3.1:** End-to-End Testing
- Test complete wizard flow
- Verify file creation in C:\claude_projects
- Test GitHub push functionality
- Verify generated prompts are valid
- Test with different project types

**Task 3.2:** Error Handling
- Add try-catch blocks to all API routes
- User-friendly error messages
- Validation on all inputs
- Handle MCP tool failures gracefully

**Task 3.3:** Polish & UX
- Loading states everywhere
- Smooth transitions
- Success confirmations
- Clear error messages
- Responsive design verification

---

### Phase 4: Deployment (DevOps Agent)
**Priority:** 🟡 MEDIUM

**Task 4.1:** Production Build
```bash
npm run build
# Test production build locally
npm run preview
```

**Task 4.2:** Create Deployment Guide

**Task 4.2:** Create Deployment Guide
```markdown
// DEPLOYMENT.md

# Dokploy Deployment Guide

## Prerequisites
- Dokploy instance running on srv838705.hstgr.cloud
- Domain: project.n8naccess.xyz
- GitHub repository connected

## Environment Variables (Set in Dokploy)
```bash
ANTHROPIC_API_KEY=your-anthropic-api-key-here
GITHUB_TOKEN=your-github-token-here
GITHUB_USERNAME=Smietje77
ACCESS_CODE=vibe2024
PUBLIC_URL=https://project.n8naccess.xyz
```

## Dokploy Setup Steps
1. Create new project in Dokploy
2. Connect GitHub repository
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variables
6. Deploy!

## Health Check
- URL: https://project.n8naccess.xyz/api/health
- Should return: { status: "ok", timestamp: "..." }
```

**Task 4.3:** Health Check Endpoint
```typescript
// src/pages/api/health.ts
GET /api/health
- Return { status: "ok", timestamp: new Date().toISOString() }
- No authentication required
```

---

## 🤝 COLLABORATION PROTOCOL

### Communication
- **Code Comments:** Explain complex logic
- **Git Commits:** Descriptive messages (e.g., "feat: add Step2 wizard component")
- **Pull Requests:** Not needed (direct commits to main for now)

### Code Review Process
1. Frontend Agent creates UI → Managing Agent reviews
2. Backend Agent creates APIs → Managing Agent tests
3. DevOps Agent deploys → Managing Agent verifies

### Conflict Resolution
- Managing Agent has final say on all decisions
- Performance concerns validated with testing
- Security issues have HIGHEST priority

### Progress Tracking
- Each agent updates this file with ✅ when task complete
- Blockers escalated immediately to Managing Agent
- Managing Agent tracks overall % completion

---

## 🎨 STYLING GUIDELINES

### Tailwind CSS Theme

### Tailwind CSS Theme
```javascript
// Use these colors throughout
colors: {
  primary: '#6366f1',    // Indigo
  secondary: '#8b5cf6',  // Purple
  success: '#10b981',    // Green
  danger: '#ef4444',     // Red
  warning: '#f59e0b',    // Amber
  dark: '#1f2937',       // Gray-800
  light: '#f9fafb'       // Gray-50
}
```

### Component Patterns
```astro
<!-- Cards -->
<div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">

<!-- Buttons -->
<button class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition">

<!-- Inputs -->
<input class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">

<!-- Spacing -->
Use: gap-4, space-y-4, p-6, mb-8
```

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Test on mobile, tablet, desktop

---

## 💻 CODE EXAMPLES

### Example: Desktop Commander File Creation
```typescript
// In src/pages/api/generate.ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
  
  // Create directory
  await desktopCommander.createDirectory({
    path: `C:\\claude_projects\\${data.projectName}`
  });
  
  // Write file
  await desktopCommander.writeFile({
    path: `C:\\claude_projects\\${data.projectName}\\README.md`,
    content: readmeContent,
    mode: 'rewrite'
  });
  
  return new Response(JSON.stringify({ success: true }));
};
```

### Example: GitHub Repository Creation
```typescript
// In src/pages/api/github-push.ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const { projectName } = await request.json();
  
  // Create repo
  const repo = await githubMCP.createRepository({
    name: projectName,
    private: true,
    description: 'Generated by Project Generator Pro'
  });
  
  // Git commands via Desktop Commander
  await desktopCommander.startProcess({
    command: `cd C:\\claude_projects\\${projectName} && git init`,
    timeout_ms: 5000
  });
  
  return new Response(JSON.stringify({ 
    success: true,
    url: repo.html_url 
  }));
};
```

---

## 🚀 EXECUTION PLAN

### Step-by-Step Workflow

### Step-by-Step Workflow

**Managing Agent - START HERE:**

1. ✅ Review this entire prompt
2. ✅ Verify project structure and existing files
3. ✅ Delegate to Frontend Agent → UI Components
4. ⏳ Delegate to Backend Agent → API Routes
5. ⏳ Test integration
6. ⏳ Delegate to DevOps Agent → Deployment
7. ⏳ Final verification

**Frontend Agent:**
1. ⏳ Create UI component library (Task 1.1)
2. ⏳ Build main page with login (Task 1.2)
3. ⏳ Create wizard steps 2, 3, 4 (Task 1.3)
4. ⏳ Style with Tailwind
5. ✅ Report completion to Managing Agent

**Backend Agent:**
1. ⏳ Create auth endpoints (Task 2.1)
2. ⏳ Create analyze endpoint (Task 2.2)
3. ⏳ Create generate endpoint with Desktop Commander (Task 2.3)
4. ⏳ Create GitHub push endpoint (Task 2.4)
5. ⏳ Add auth middleware (Task 2.5)
6. ✅ Report completion to Managing Agent

**DevOps Agent:**
1. ⏳ Test production build (Task 4.1)
2. ⏳ Create deployment guide (Task 4.2)
3. ⏳ Create health check (Task 4.3)
4. ⏳ Assist with Dokploy deployment
5. ✅ Report completion to Managing Agent

---

## 📝 IMPORTANT NOTES

### Desktop Commander Integration
- **CRITICAL:** Use `desktop-commander:write_file` with `mode: 'rewrite'` for new files
- **CRITICAL:** Use `desktop-commander:create_directory` before writing files
- **Always use absolute paths:** `C:\claude_projects\[project-name]\...`
- **Windows paths:** Use double backslashes `\\` or forward slashes `/`

### GitHub MCP Integration
- **Repository names:** lowercase, hyphens only (sanitize project names)
- **Private repos by default** for user projects
- **Initial commit message:** "Initial commit from Project Generator Pro"

### Authentication
- **Access code:** vibe2024 (stored in .env)
- **Cookie-based auth** (7 day expiry)
- **Protect all API routes** except /api/auth/* and /api/health

### Error Handling
- **Always wrap MCP calls in try-catch**
- **User-friendly error messages** (don't expose internal errors)
- **Log errors** to console for debugging
- **Return structured errors:** `{ success: false, error: "message" }`

---

## 🎯 SUCCESS CRITERIA

Project is complete when:
- ✅ User can access site at project.n8naccess.xyz
- ✅ Login with "vibe2024" works
- ✅ 4-step wizard is fully functional
- ✅ Project generation creates files in C:\claude_projects
- ✅ Generated projects auto-push to GitHub
- ✅ All MCP integrations work
- ✅ No console errors
- ✅ Responsive on mobile/tablet/desktop
- ✅ Production deployed to Dokploy

---

## 🚀 BEGIN EXECUTION NOW!

**Managing Agent:** 
1. Read this entire prompt carefully
2. Verify you have access to desktop-commander and github MCPs
3. Start delegating tasks to Frontend and Backend agents
4. Monitor progress
5. Coordinate between agents
6. Test thoroughly
7. Deploy to production

**LET'S BUILD THIS! 💪**

---

*Generated by Project Generator Pro*
*Version: 1.0.0*
*Date: 2025-11-15*
