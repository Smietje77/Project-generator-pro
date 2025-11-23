# 🤖 Agents MCP Integration - Claude Code Prompt

## 🎯 Doel
Integreer de bestaande Agents MCP server volledig in Project Generator Pro, zodat elk gegenereerd project automatisch agents krijgt die via de MCP beschikbaar zijn.

---

## 📋 Context

### Wat is Agents MCP?
Een herbruikbare MCP server op `C:\Users\bjorn\agents-mcp-server\` die agent markdown bestanden beschikbaar maakt in Claude Code en Claude Desktop. De server detecteert automatisch welk project je gebruikt en laadt de bijbehorende agents uit `.claude/agents/`.

### Huidige Situatie
- ✅ Project Generator Pro heeft zelf agents MCP werkend (zie `.mcp.json`)
- ✅ Agent markdown bestanden bestaan in `.claude/agents/` (8 agents)
- ⚠️ **PROBLEEM:** Nieuw gegenereerde projecten krijgen nog GEEN werkende agents MCP
- ⚠️ **PROBLEEM:** `mcpConfigGenerator.ts` gebruikt verkeerde command voor agents MCP

### Wat er Moet Gebeuren
1. Fix `mcpConfigGenerator.ts` - gebruik `node` i.p.v. `npx` voor agents MCP
2. Zorg dat gegenereerde projecten de juiste `AGENTS_DIR` env variable krijgen
3. Test dat nieuwe projecten direct agents kunnen laden via `/mcp` in Claude Code

---

## 🔧 Required Changes

### 1. Fix mcpConfigGenerator.ts (src/lib/mcpConfigGenerator.ts)

**Huidige code (FOUT):**
```typescript
// Agents MCP (if custom agent server is available)
config.mcpServers['agents'] = {
  command: 'cmd',
  args: ['/c', 'npx', '-y', 'agents-mcp-server']
};
```

**Nieuwe code (CORRECT):**
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

**Waarom deze fix?**
- Agents MCP is een lokale Node.js server, niet een npx package
- De `AGENTS_DIR` env variable zorgt ervoor dat de juiste agents geladen worden
- Gebruik dubbele backslashes voor Windows paths in JSON

### 2. Update createMCPConfig in projectCreator.ts

**Locatie:** `src/lib/projectCreator.ts` regel ~147

**Huidige code:**
```typescript
private async createMCPConfig(projectPath: string, mcps: any[]): Promise<string> {
  const configPath = path.join(projectPath, '.mcp.json');
  const claudeDir = path.join(projectPath, '.claude');
  
  // Ensure .claude directory exists
  await fs.mkdir(claudeDir, { recursive: true });
  
  // Generate MCP configuration
  const config = generateMCPConfig(mcps, projectPath, {
    githubToken: process.env.GITHUB_TOKEN,
    supabaseProjectRef: process.env.SUPABASE_PROJECT_REF,
    supabaseAccessToken: process.env.SUPABASE_ACCESS_TOKEN
  });
```

**Geen wijziging nodig** - deze functie is correct, maar verifieer dat:
- De `claudeDir` wordt aangemaakt VOOR `generateMCPConfig` wordt aangeroepen
- De `projectPath` die wordt doorgegeven is een absoluut Windows pad

### 3. Verifieer createAgentFiles in projectCreator.ts

**Locatie:** `src/lib/projectCreator.ts` regel ~125

Deze functie moet al correct zijn, maar verifieer:
```typescript
private async createAgentFiles(projectPath: string, agents: any[], projectName: string): Promise<string[]> {
  const paths: string[] = [];
  const agentsDir = path.join(projectPath, '.claude', 'agents');
  
  // Create agents directory - DIT IS CRUCIAAL
  await fs.mkdir(agentsDir, { recursive: true });
  
  for (const agent of agents) {
    const agentPath = path.join(agentsDir, `${agent.id}-agent.md`);
    const markdown = generateAgentMarkdown(agent, projectName);
    
    await fs.writeFile(agentPath, markdown, 'utf-8');
    paths.push(agentPath);
  }

  return paths;
}
```

**Verificatiepunten:**
- ✅ Directory wordt aangemaakt met `recursive: true`
- ✅ Agent ID wordt gebruikt voor bestandsnaam (bijv. `managing-agent.md`)
- ✅ `generateAgentMarkdown` functie bestaat en werkt

---

## 🧪 Testing Protocol

### Test 1: Genereer Test Project
```bash
# Start development server
npm run dev

# In browser:
# 1. Login met "vibe2024"
# 2. Maak nieuw test project:
#    - Name: agents-test-project
#    - Type: SaaS Application
#    - Features: 2-3 features selecteren
# 3. Complete wizard en genereer project
```

### Test 2: Verifieer File Structure
```bash
# Check dat alles is aangemaakt
cd C:\claude_projects\agents-test-project

# Moet bestaan:
dir .claude\agents           # Moet 8 .md bestanden bevatten
type .mcp.json               # Moet agents MCP bevatten met correcte config
type .claude\agents\managing-agent.md  # Check inhoud
```

### Test 3: Test in Claude Code
```bash
# Open project in Claude Code
cd C:\claude_projects\agents-test-project
claude-code

# In Claude Code:
/mcp
# -> Moet "agents" laten zien als "connected"

List my available agents
# -> Moet 8 agents tonen (managing, frontend, backend, devops, data, documentation, qa, security)

Load the managing-agent
# -> Moet agent laden en instructies tonen

Use the managing-agent to analyze this project structure
# -> Agent moet kunnen werken met project
```

### Test 4: Verifieer AGENTS_DIR Environment
```bash
# In test project .mcp.json
type .mcp.json | findstr AGENTS_DIR
# Output moet zijn:
# "AGENTS_DIR": "C:\\claude_projects\\agents-test-project\\.claude\\agents"
```

---

## 📝 Checklist

### Pre-Implementation
- [ ] Lees `mcpConfigGenerator.ts` volledig
- [ ] Lees `projectCreator.ts` volledig
- [ ] Begrijp hoe agents MCP werkt (zie document bovenaan)
- [ ] Check huidige `.mcp.json` van project-generator-pro zelf

### Implementation
- [ ] Fix agents MCP config in `mcpConfigGenerator.ts`
- [ ] Verifieer `createAgentFiles` maakt directory correct aan
- [ ] Verifieer volgorde: agents directory → MCP config → files schrijven
- [ ] Test build: `npm run build` succesvol
- [ ] Test development: `npm run dev` werkt

### Testing
- [ ] Genereer test project via UI
- [ ] Verifieer `.claude/agents/` bestaat met 8 bestanden
- [ ] Verifieer `.mcp.json` heeft agents config met AGENTS_DIR
- [ ] Open in Claude Code en test `/mcp` command
- [ ] Test `List my available agents` command
- [ ] Test `Load the managing-agent` command
- [ ] Verifieer agent kan gebruikt worden in project

### Validation
- [ ] Agents MCP toont "connected" in `/mcp`
- [ ] Alle 8 agents zijn beschikbaar
- [ ] Agent markdown bestanden bevatten project-specifieke info
- [ ] AGENTS_DIR wijst naar juiste directory
- [ ] Test met 2e project - moet ook werken

---

## 🚨 Common Issues & Solutions

### Issue 1: "agents" not connected in /mcp
**Symptoom:** `/mcp` toont agents als "disconnected"

**Oplossingen:**
1. Check `.mcp.json` syntax (valid JSON?)
2. Verifieer `C:\Users\bjorn\agents-mcp-server\index.js` bestaat
3. Herstart Claude Code volledig
4. Check AGENTS_DIR path heeft dubbele backslashes

### Issue 2: "No agents found"
**Symptoom:** `List my available agents` toont geen agents

**Oplossingen:**
1. Verifieer `.claude/agents/` directory bestaat
2. Check dat 8 .md bestanden in directory staan
3. Verifieer AGENTS_DIR in .mcp.json correct is
4. Check file permissions (readable?)

### Issue 3: Agent markdown is leeg/incorrect
**Symptoom:** Agent laadt maar heeft geen content of verkeerde content

**Oplossingen:**
1. Check `agentTemplates.ts` - bestaat deze?
2. Verifieer `generateAgentMarkdown()` functie
3. Check of agent definitions in `analysis.ts` correct zijn
4. Verifieer project name wordt correct doorgegeven

### Issue 4: Build fails
**Symptoom:** `npm run build` geeft TypeScript errors

**Oplossingen:**
1. Check imports in `mcpConfigGenerator.ts`
2. Verifieer `path` module is geïmporteerd: `import path from 'path';`
3. Run `npm install` om dependencies te updaten
4. Check `tsconfig.json` configuration

---

## 🎯 Success Criteria

Het is succesvol als:

1. ✅ Nieuw gegenereerd project heeft `.mcp.json` met agents MCP
2. ✅ `.claude/agents/` directory wordt aangemaakt met 8 bestanden
3. ✅ Agents MCP toont "connected" in Claude Code
4. ✅ `List my available agents` toont alle 8 agents
5. ✅ Agents kunnen geladen en gebruikt worden
6. ✅ AGENTS_DIR environment variable is correct
7. ✅ Werkt voor elk nieuw gegenereerd project
8. ✅ Build succesvol: `npm run build`

---

## 🔍 MCP Servers to Use

### Required for Implementation
1. **desktop-commander** - Voor file operations en testing
2. **github** - Als je wijzigingen wilt committen
3. **context7** - Voor documentatie opzoeken indien nodig

### Commands You'll Need
```bash
# Read files
Read src/lib/mcpConfigGenerator.ts

# Write/edit files  
Use str_replace to update mcpConfigGenerator.ts

# List directory
List .claude/agents directory contents

# Create test project directory
Create C:\claude_projects\agents-test-project\.claude\agents directory

# Read generated config
Read C:\claude_projects\agents-test-project\.mcp.json
```

---

## 📚 Reference Documents

### Key Files to Study
1. `C:\claude_projects\project-generator-pro\.mcp.json` - Werkende agents config
2. `C:\Users\bjorn\agents-mcp-server\index.js` - Agents MCP server code
3. `src/lib/mcpConfigGenerator.ts` - Waar de fix moet komen
4. `src/lib/projectCreator.ts` - Orchestration logic
5. `.claude/agents/managing-agent.md` - Voorbeeld agent structuur

### Environment Variables Needed
```bash
GITHUB_TOKEN=your_github_token_here
SUPABASE_PROJECT_REF=your_supabase_project_ref
SUPABASE_ACCESS_TOKEN=your_supabase_access_token
```

---

## 🎬 Start Here

1. **Lees eerst** alle code in `mcpConfigGenerator.ts` en `projectCreator.ts`
2. **Begrijp** hoe agents MCP werkt (auto-detect via AGENTS_DIR)
3. **Implementeer** de fix in `mcpConfigGenerator.ts` (zie sectie 1)
4. **Test** met een dummy project (zie Testing Protocol)
5. **Verifieer** in Claude Code dat alles werkt
6. **Commit** changes naar GitHub

### Opening Command for Claude Code
```
I need to integrate the Agents MCP server into Project Generator Pro's project generation workflow. 

The goal: Every newly generated project should automatically have a working Agents MCP configuration that loads 8 AI agent markdown files.

Current issue: The mcpConfigGenerator.ts uses incorrect npx command instead of node command for agents MCP.

Please analyze the current implementation and implement the fix detailed in CLAUDE_CODE_PROMPT_AGENTS_MCP.md
```

---

**Good luck! 🚀**

*Generated for: Project Generator Pro v1.0.0*  
*Date: 2024-11-23*  
*Context: Agents MCP Integration Phase*
