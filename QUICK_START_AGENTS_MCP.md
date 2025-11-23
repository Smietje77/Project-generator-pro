# 🚀 Quick Start: Agents MCP Integratie

## Voor Björn - Snelle Referentie

### 📋 Wat Moet Gebeuren

**Probleem:**  
Nieuw gegenereerde projecten krijgen geen werkende agents MCP omdat `mcpConfigGenerator.ts` de verkeerde command gebruikt.

**Oplossing:**  
Fix één regel code in `mcpConfigGenerator.ts` om `node` i.p.v. `npx` te gebruiken voor agents MCP.

---

## 🎯 De Exacte Fix

### Bestand: `src/lib/mcpConfigGenerator.ts`

**Zoek deze code (regel ~103):**
```typescript
// Agents MCP (if custom agent server is available)
config.mcpServers['agents'] = {
  command: 'cmd',
  args: ['/c', 'npx', '-y', 'agents-mcp-server']
};
```

**Vervang met:**
```typescript
// Agents MCP - altijd toevoegen met correcte node command
const agentsDir = path.join(projectPath, '.claude', 'agents').replace(/\\/g, '\\\\');

config.mcpServers['agents'] = {
  command: 'node',
  args: ['C:\\Users\\bjorn\\agents-mcp-server\\index.js'],
  env: {
    AGENTS_DIR: agentsDir
  }
};
```

**Voeg import toe (bovenaan bestand als deze er nog niet is):**
```typescript
import path from 'path';
```

---

## ✅ Quick Test

Na de fix:

```bash
# 1. Build
npm run build

# 2. Start dev server
npm run dev

# 3. In browser (localhost:4321):
# - Login: vibe2024
# - Maak test project: "agents-test-project"
# - Complete wizard

# 4. Check resultaat
cd C:\claude_projects\agents-test-project
type .mcp.json
# Moet agents MCP hebben met AGENTS_DIR

dir .claude\agents
# Moet 8 .md bestanden tonen

# 5. Test in Claude Code
claude-code
# Dan in Claude Code:
/mcp
List my available agents
```

---

## 🤖 Voor Claude Code

**Kopieer deze prompt in Claude Code:**

```
I need to integrate the Agents MCP server into Project Generator Pro's project generation workflow.

Current issue: The mcpConfigGenerator.ts uses incorrect npx command instead of node command for agents MCP.

Please:
1. Read src/lib/mcpConfigGenerator.ts
2. Find the agents MCP configuration (around line 103)
3. Replace the npx command with node command pointing to C:\Users\bjorn\agents-mcp-server\index.js
4. Add AGENTS_DIR environment variable that points to projectPath/.claude/agents
5. Ensure path module is imported
6. Test the build

Reference: See CLAUDE_CODE_PROMPT_AGENTS_MCP.md for complete details.
```

---

## 📁 Belangrijke Bestanden

| Bestand | Doel |
|---------|------|
| `src/lib/mcpConfigGenerator.ts` | **FIX HIER** - MCP config generator |
| `src/lib/projectCreator.ts` | Orchestreert project creatie |
| `src/lib/agentTemplates.ts` | Genereert agent markdown |
| `.mcp.json` | Werkende example in dit project |
| `.claude/agents/` | 8 agent markdown bestanden |

---

## 🎯 Success = 

- ✅ Build werkt: `npm run build`
- ✅ Nieuwe projecten hebben `.mcp.json` met agents
- ✅ `.claude/agents/` directory wordt aangemaakt
- ✅ AGENTS_DIR env variable is correct
- ✅ Agents werken in Claude Code: `/mcp` + `List my available agents`

---

**That's it! Simple fix, big impact! 🚀**
