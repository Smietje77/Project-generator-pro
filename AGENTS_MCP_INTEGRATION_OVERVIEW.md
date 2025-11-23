# 📊 Agents MCP Integration - Overzicht

## ✅ Wat is Aangemaakt

### 1. CLAUDE_CODE_PROMPT_AGENTS_MCP.md
**Doel:** Complete, gedetailleerde prompt voor Claude Code  
**Inhoud:**
- Context over Agents MCP systeem
- Exacte code changes die nodig zijn
- Testing protocol (4 tests)
- Checklist (pre-implementation, implementation, testing, validation)
- Common issues & solutions
- Success criteria
- Reference documents
- Opening command voor Claude Code

**Gebruik:** Geef deze aan Claude Code voor complete implementatie

---

### 2. QUICK_START_AGENTS_MCP.md  
**Doel:** Snelle referentie voor Björn  
**Inhoud:**
- Probleem uitleg in 2 zinnen
- Exacte code fix (copy-paste ready)
- Quick test steps
- Claude Code prompt (kortere versie)
- Belangrijke bestanden tabel
- Success criteria

**Gebruik:** Snelle lookup, of als je zelf de fix wilt doen

---

## 🎯 Kern Probleem

**Huidige situatie:**
```typescript
// FOUT - gebruikt npx
config.mcpServers['agents'] = {
  command: 'cmd',
  args: ['/c', 'npx', '-y', 'agents-mcp-server']
};
```

**Moet worden:**
```typescript
// CORRECT - gebruikt node met AGENTS_DIR
const agentsDir = path.join(projectPath, '.claude', 'agents').replace(/\\/g, '\\\\');

config.mcpServers['agents'] = {
  command: 'node',
  args: ['C:\\Users\\bjorn\\agents-mcp-server\\index.js'],
  env: {
    AGENTS_DIR: agentsDir
  }
};
```

**Waarom:**
- Agents MCP is een lokale Node.js server, niet een npm package
- AGENTS_DIR zorgt dat agents uit juiste directory worden geladen
- Dubbele backslashes zijn nodig voor JSON escaping

---

## 🔧 Bestand dat Gewijzigd Moet Worden

**Locatie:** `src/lib/mcpConfigGenerator.ts`  
**Regel:** ~103 (in de `generateMCPConfig` functie)  
**Import toevoegen:** `import path from 'path';` (als deze er nog niet is)

---

## 📋 Volgende Stappen

### Optie A: Claude Code (Aanbevolen)
1. Open Claude Code in project directory
2. Kopieer prompt uit `CLAUDE_CODE_PROMPT_AGENTS_MCP.md`
3. Plak in Claude Code
4. Laat Claude Code de fix implementeren + testen

### Optie B: Handmatig
1. Open `src/lib/mcpConfigGenerator.ts`
2. Zoek regel ~103 (agents MCP config)
3. Vervang met code uit `QUICK_START_AGENTS_MCP.md`
4. Run `npm run build` om te verifiëren
5. Test met dummy project

---

## ✅ Verificatie Checklist

Na de fix:

- [ ] `npm run build` succesvol
- [ ] `npm run dev` werkt
- [ ] Nieuw project genereren via UI
- [ ] Check `.mcp.json` heeft agents met AGENTS_DIR
- [ ] Check `.claude/agents/` bestaat met 8 bestanden
- [ ] Open in Claude Code: `/mcp` toont agents connected
- [ ] Run `List my available agents` - toont 8 agents
- [ ] Test `Load the managing-agent` - werkt

---

## 🎓 Context: Hoe Agents MCP Werkt

### Auto-detect Mechanisme
Agents MCP server zoekt agents in deze volgorde:
1. **AGENTS_DIR environment variable** (project-specifiek via .mcp.json)
2. `process.cwd()/.claude/agents` (current directory)
3. Fallback naar subscription-manager-pro

### Waarom Dit Belangrijk Is
- Elk project heeft eigen agents met project-specifieke instructies
- Agents blijven beschikbaar in Claude Code via `/mcp`
- No manual setup needed - werkt automatisch

### Project Structure
```
generated-project/
├── .mcp.json                      # MCP config met AGENTS_DIR
├── .claude/
│   └── agents/                    # 8 agent markdown bestanden
│       ├── managing-agent.md
│       ├── frontend-agent.md
│       ├── backend-agent.md
│       ├── devops-agent.md
│       ├── data-agent.md
│       ├── documentation-agent.md
│       ├── qa-agent.md
│       └── security-agent.md
└── [rest of project]
```

---

## 📚 Extra Resources

### Bestaande Werkende Config
Bekijk `.mcp.json` in dit project voor een werkend voorbeeld:
```bash
type C:\claude_projects\project-generator-pro\.mcp.json
```

### Agents MCP Server Code
Lokale server die alles aanstuurt:
```bash
C:\Users\bjorn\agents-mcp-server\index.js
```

### Agent Templates
Zie bestaande agents voor structuur:
```bash
type C:\claude_projects\project-generator-pro\.claude\agents\managing-agent.md
```

---

## 🚨 Als Het Niet Werkt

### Symptoom 1: Build fails
**Fix:** Check import van `path` module bovenaan mcpConfigGenerator.ts

### Symptom 2: Agents not connected in Claude Code
**Fix:** 
- Verifieer `.mcp.json` syntax (valid JSON?)
- Check `C:\Users\bjorn\agents-mcp-server\index.js` exists
- Herstart Claude Code

### Symptom 3: No agents found
**Fix:**
- Check `.claude/agents/` directory exists
- Verifieer 8 .md files present
- Check AGENTS_DIR path in .mcp.json

---

## 💡 Tips

1. **Test met dummy project eerst** - maak "agents-test-project"
2. **Check /mcp altijd** - verifieer agents connected
3. **Windows paths** - gebruik dubbele backslashes in JSON
4. **Herstart bij config changes** - Claude Code moet herstarten

---

## 🎯 Eind Resultaat

Na succesvolle integratie:
- ✅ Elk nieuw gegenereerd project heeft werkende agents MCP
- ✅ Developers kunnen meteen agents gebruiken in Claude Code
- ✅ Agents hebben project-specifieke context
- ✅ Geen manual setup required
- ✅ Consistent developer experience

---

**Status:** Ready for implementation  
**Priority:** High (core feature)  
**Complexity:** Low (single file change)  
**Impact:** High (enables agent-driven development)

---

*Aangemaakt: 2024-11-23*  
*Voor: Project Generator Pro v1.0.0*  
*Door: Claude (met Björn's context)*
