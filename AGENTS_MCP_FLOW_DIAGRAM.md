# 🔄 Agents MCP Integration Flow

## Current Flow (Before Fix) ❌

```
User Creates Project via UI
         ↓
projectCreator.ts
         ↓
createMCPConfig()
         ↓
generateMCPConfig() 
         ↓
❌ WRONG: Uses npx for agents MCP
         ↓
Generated .mcp.json
         ↓
{
  "agents": {
    "command": "cmd",
    "args": ["/c", "npx", "-y", "agents-mcp-server"]
    // ❌ Missing AGENTS_DIR!
  }
}
         ↓
Claude Code Opens Project
         ↓
❌ Agents MCP Fails to Connect
         ↓
/mcp shows agents: disconnected
```

---

## Target Flow (After Fix) ✅

```
User Creates Project via UI
         ↓
projectCreator.ts
         ↓
1. createProjectStructure()
   - Creates .claude/agents/ directory
         ↓
2. createAgentFiles()
   - Writes 8 agent markdown files
   - managing-agent.md
   - frontend-agent.md
   - backend-agent.md
   - devops-agent.md
   - data-agent.md
   - documentation-agent.md
   - qa-agent.md
   - security-agent.md
         ↓
3. createMCPConfig()
         ↓
   generateMCPConfig()
   ✅ CORRECT: Uses node + AGENTS_DIR
         ↓
Generated .mcp.json
         ↓
{
  "agents": {
    "command": "node",
    "args": ["C:\\Users\\bjorn\\agents-mcp-server\\index.js"],
    "env": {
      "AGENTS_DIR": "C:\\project-path\\.claude\\agents"
    }
  }
}
         ↓
Claude Code Opens Project
         ↓
Reads .mcp.json
         ↓
Starts Agents MCP Server
         ↓
Server reads AGENTS_DIR env variable
         ↓
Loads agents from .claude/agents/
         ↓
✅ All 8 agents available
         ↓
/mcp shows agents: connected
         ↓
Developer runs: List my available agents
         ↓
Claude shows:
1. Managing Agent
2. Frontend Agent  
3. Backend Agent
4. DevOps Agent
5. Data Agent
6. Documentation Agent
7. QA Agent
8. Security Agent
         ↓
Developer runs: Load the managing-agent
         ↓
✅ Agent ready to coordinate development!
```

---

## File Dependencies

```
┌─────────────────────────────────┐
│   User Input (UI Wizard)        │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│  src/pages/api/generate.ts      │
│  - Receives project config      │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│  src/lib/projectCreator.ts      │
│  - Orchestrates creation         │
│  - createProject()               │
└────────────┬────────────────────┘
             ↓
     ┌───────┴────────┐
     ↓                ↓
┌─────────┐    ┌──────────────┐
│ Create  │    │ Generate MCP │
│ Agents  │    │ Config       │
└────┬────┘    └──────┬───────┘
     ↓                ↓
┌─────────────┐  ┌──────────────────────┐
│ agentTemp-  │  │ mcpConfigGenerator.ts │ ← FIX HERE!
│ lates.ts    │  │ - generateMCPConfig() │
└─────────────┘  └──────────────────────┘
                          ↓
                 ┌────────────────┐
                 │ Generated      │
                 │ .mcp.json      │
                 └────────────────┘
```

---

## The Fix - Code Flow

```typescript
// src/lib/mcpConfigGenerator.ts

export function generateMCPConfig(
  mcpServers: MCPServer[],
  projectPath: string,  ← Input: "C:\\claude_projects\\my-project"
  options: { ... }
): MCPConfig {
  
  const config: MCPConfig = { mcpServers: {} };
  
  // ... other MCP configs ...
  
  // ✅ THE FIX:
  const agentsDir = path.join(projectPath, '.claude', 'agents')
                    //  → "C:\\claude_projects\\my-project\\.claude\\agents"
                        .replace(/\\/g, '\\\\');
                    //  → "C:\\\\claude_projects\\\\my-project\\\\.claude\\\\agents"
                    //     (escaped for JSON)
  
  config.mcpServers['agents'] = {
    command: 'node',
    args: ['C:\\Users\\bjorn\\agents-mcp-server\\index.js'],
    env: {
      AGENTS_DIR: agentsDir  ← Key: tells server where to find agents
    }
  };
  
  return config;
}
```

---

## Directory Structure (Generated Project)

```
C:\claude_projects\my-new-project\
│
├── .mcp.json                    ← Contains agents MCP config with AGENTS_DIR
│   {
│     "mcpServers": {
│       "agents": {
│         "command": "node",
│         "args": ["C:\\Users\\bjorn\\agents-mcp-server\\index.js"],
│         "env": {
│           "AGENTS_DIR": "C:\\claude_projects\\my-new-project\\.claude\\agents"
│         }
│       }
│     }
│   }
│
├── .claude\
│   ├── agents\                  ← Agent markdown files (loaded by MCP server)
│   │   ├── managing-agent.md
│   │   ├── frontend-agent.md
│   │   ├── backend-agent.md
│   │   ├── devops-agent.md
│   │   ├── data-agent.md
│   │   ├── documentation-agent.md
│   │   ├── qa-agent.md
│   │   └── security-agent.md
│   │
│   ├── PROJECT_PROMPT.md        ← Generated AI instructions
│   └── STARTER_PROMPT.md        ← Quick start for developers
│
├── src\                         ← Application code
├── package.json
├── README.md
└── ...
```

---

## MCP Server Auto-detect Logic

```
Agents MCP Server Starts
         ↓
Checks Environment Variables
         ↓
AGENTS_DIR set? 
         ↓
    ┌────┴────┐
   YES       NO
    ↓         ↓
Use      Try process.cwd()/.claude/agents
AGENTS_DIR    ↓
    │    Found agents?
    │         ↓
    │    ┌────┴────┐
    │   YES       NO
    │    ↓         ↓
    │   Use    Fallback to
    │   cwd    subscription-
    │           manager-pro
    │              ↓
    └──────┬───────┘
           ↓
    Load agent files
           ↓
    Parse markdown
           ↓
    Register as MCP tools
           ↓
    ✅ Agents available in Claude Code
```

---

## Testing Flow

```
1. Fix Code
   └─→ Edit mcpConfigGenerator.ts
       └─→ Replace npx with node + AGENTS_DIR
           └─→ npm run build

2. Generate Test Project
   └─→ npm run dev
       └─→ Login (vibe2024)
           └─→ Create "agents-test-project"
               └─→ Complete wizard

3. Verify Files
   └─→ cd C:\claude_projects\agents-test-project
       ├─→ Check .mcp.json (agents config present?)
       └─→ Check .claude\agents\ (8 files present?)

4. Test in Claude Code  
   └─→ claude-code
       ├─→ /mcp (agents connected?)
       ├─→ List my available agents (shows 8?)
       ├─→ Load the managing-agent (works?)
       └─→ Use agent (functional?)

5. ✅ Success!
```

---

## Common Pitfalls & Solutions

```
Issue: Build fails
├─→ Missing import?
│   └─→ Add: import path from 'path';
│
├─→ TypeScript error?
│   └─→ Check path module typing
│
└─→ Syntax error?
    └─→ Check JSON escaping (\\\\)

Issue: Agents not connected
├─→ .mcp.json invalid JSON?
│   └─→ Validate with JSON linter
│
├─→ Server path wrong?
│   └─→ Verify C:\Users\bjorn\agents-mcp-server\index.js exists
│
└─→ AGENTS_DIR wrong?
    └─→ Check path escaping (double backslashes)

Issue: No agents found
├─→ Directory missing?
│   └─→ Verify .claude/agents/ exists
│
├─→ Files missing?
│   └─→ Check 8 .md files present
│
└─→ Permissions?
    └─→ Check files are readable

Issue: Agent content wrong
└─→ Check generateAgentMarkdown() in agentTemplates.ts
```

---

## Success Metrics

```
✅ Technical Success
   ├─ npm run build: SUCCESS
   ├─ npm run dev: RUNNING
   ├─ Generated .mcp.json: VALID
   ├─ Generated agents/: 8 FILES
   └─ AGENTS_DIR: CORRECT PATH

✅ Functional Success
   ├─ /mcp: agents CONNECTED
   ├─ List agents: 8 SHOWN
   ├─ Load agent: WORKS
   └─ Use agent: FUNCTIONAL

✅ User Experience
   ├─ No manual setup needed
   ├─ Works immediately in Claude Code
   ├─ Consistent across projects
   └─ Project-specific context
```

---

**This flow ensures every generated project has working agents from day one! 🚀**
