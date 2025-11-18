import type { AnalysisResult, GeneratedPrompt, Agent, Task } from './types';

/**
 * Generates Claude Code compatible prompts
 */
export class PromptGenerator {
  
  generate(analysis: AnalysisResult, discoveryData?: any): GeneratedPrompt {
    const markdown = this.buildMarkdown(analysis, discoveryData);

    return {
      markdown,
      metadata: {
        projectName: analysis.project.name,
        totalAgents: analysis.requiredAgents.length,
        totalMCPs: analysis.recommendedMCPs.length,
        totalTasks: analysis.taskBreakdown.length,
        generatedAt: new Date()
      }
    };
  }

  private buildMarkdown(analysis: AnalysisResult, discoveryData?: any): string {
    const sections = [
      this.buildHeader(analysis),
      this.buildProjectContext(analysis),
    ];

    // Add discovery interview section if data exists
    if (discoveryData && discoveryData.questions && discoveryData.answers) {
      sections.push(this.buildDiscoverySection(discoveryData));
    }

    sections.push(
      this.buildMCPSection(analysis),
      this.buildAgentsSection(analysis),
      this.buildTaskBreakdown(analysis),
      this.buildCollaborationProtocol(analysis),
      this.buildFooter()
    );

    return sections.join('\n\n---\n\n');
  }

  private buildHeader(analysis: AnalysisResult): string {
    return `# ${analysis.project.name}

**Project Type:** ${analysis.project.type.toUpperCase()}  
**Complexity:** ${analysis.project.metadata.estimatedComplexity}  
**Estimated Duration:** ${analysis.project.metadata.estimatedDuration}  
**Team Size:** ${analysis.project.metadata.teamSize} AI Agents

Generated: ${new Date().toISOString()}`;
  }

  private buildProjectContext(analysis: AnalysisResult): string {
    const { project } = analysis;

    let context = `## 📋 Project Context

### Description
${project.description}

### Core Features
${project.features.map(f => `- **${f.name}** (${f.category})`).join('\n')}

### Tech Stack`;

    if (project.techStack.frontend?.length) {
      context += `\n**Frontend:** ${project.techStack.frontend.join(', ')}`;
    }
    if (project.techStack.backend?.length) {
      context += `\n**Backend:** ${project.techStack.backend.join(', ')}`;
    }
    if (project.techStack.database?.length) {
      context += `\n**Database:** ${project.techStack.database.join(', ')}`;
    }

    return context;
  }

  private buildDiscoverySection(discoveryData: any): string {
    const { questions, answers } = discoveryData;

    let section = `## 💡 Discovery Interview Insights

The following requirements and preferences were gathered through an AI-powered discovery interview:

`;

    // Group questions by category
    const categories: Record<string, any[]> = {};
    questions.forEach((q: any) => {
      const category = q.category || 'other';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(q);
    });

    // Category display names and emojis
    const categoryInfo: Record<string, { name: string; emoji: string }> = {
      design: { name: 'Design & UX', emoji: '🎨' },
      functionality: { name: 'Functionality', emoji: '⚡' },
      data: { name: 'Data & Database', emoji: '🗄️' },
      audience: { name: 'Target Audience', emoji: '👥' },
      technical: { name: 'Technical Requirements', emoji: '🔧' },
      other: { name: 'Additional Details', emoji: '📝' }
    };

    // Render each category
    Object.entries(categories).forEach(([category, categoryQuestions]) => {
      const info = categoryInfo[category] || categoryInfo.other;
      section += `### ${info.emoji} ${info.name}\n\n`;

      categoryQuestions.forEach((q: any) => {
        const answer = answers[q.id];

        // Skip if no answer provided
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
          return;
        }

        section += `**Q: ${q.question}**  \n`;

        // Format answer based on type
        if (Array.isArray(answer)) {
          // Checkbox answers
          section += `A: ${answer.join(', ')}\n\n`;
        } else {
          // Single value (text, textarea, radio)
          section += `A: ${answer}\n\n`;
        }
      });
    });

    section += `*These insights should guide all implementation decisions and ensure the final product matches user expectations.*`;

    return section;
  }

  private buildMCPSection(analysis: AnalysisResult): string {
    let section = `## 🔧 Available MCP Servers

The following MCP servers are available for this project:

`;

    analysis.recommendedMCPs.forEach(mcp => {
      section += `### ${mcp.name}
**ID:** \`${mcp.id}\`  
**Description:** ${mcp.description}

**Capabilities:**
${mcp.capabilities.map(c => `- ${c}`).join('\n')}

**Use Cases:**
${mcp.useCases.map(u => `- ${u}`).join('\n')}

`;
    });

    return section;
  }

  private buildAgentsSection(analysis: AnalysisResult): string {
    let section = `## 🤖 AI Agents

This project requires ${analysis.requiredAgents.length} specialized AI agents working together:

`;

    analysis.requiredAgents.forEach((agent, index) => {
      const priorityEmoji = {
        critical: '🔴',
        high: '🟠',
        medium: '🟡',
        low: '🟢'
      }[agent.priority];

      section += `### ${index + 1}. ${agent.name} ${priorityEmoji}

**Role:** ${agent.role}

**Responsibilities:**
${agent.responsibilities.map(r => `- ${r}`).join('\n')}

**MCP Access:**
${agent.mcpAccess.map(mcp => `- \`${mcp}\``).join('\n')}

**Collaborates With:**
${agent.collaboratesWith.length ? agent.collaboratesWith.map(a => `- ${a}`).join('\n') : '- Works independently'}

`;
    });

    return section;
  }

  private buildTaskBreakdown(analysis: AnalysisResult): string {
    let section = `## 📊 Task Breakdown

Total Tasks: ${analysis.taskBreakdown.length}  
Estimated Total Hours: ${analysis.taskBreakdown.reduce((sum, t) => sum + t.estimatedHours, 0)}

`;

    // Group tasks by agent
    const tasksByAgent = new Map<string, Task[]>();
    analysis.taskBreakdown.forEach(task => {
      if (!tasksByAgent.has(task.assignedAgent)) {
        tasksByAgent.set(task.assignedAgent, []);
      }
      tasksByAgent.get(task.assignedAgent)!.push(task);
    });

    tasksByAgent.forEach((tasks, agentId) => {
      const agent = analysis.requiredAgents.find(a => a.id === agentId);
      section += `### ${agent?.name || agentId}

${tasks.map(t => `**${t.id}:** ${t.title}  
${t.description}  
*Estimated: ${t.estimatedHours}h | Dependencies: ${t.dependencies.join(', ') || 'None'}*
`).join('\n')}
`;
    });

    return section;
  }

  private buildCollaborationProtocol(analysis: AnalysisResult): string {
    const protocol = analysis.collaborationProtocol;

    return `## 🤝 Collaboration Protocol

### Communication Channels
${protocol.communicationChannels.map(c => `- ${c}`).join('\n')}

### Review Process
${protocol.reviewProcess.map(r => `- ${r}`).join('\n')}

### Conflict Resolution
${protocol.conflictResolution.map(c => `- ${c}`).join('\n')}

### Progress Tracking
${protocol.progressTracking.map(p => `- ${p}`).join('\n')}`;
  }

  private buildFooter(): string {
    return `## 🚀 Getting Started

**IMPORTANT INSTRUCTIONS FOR CLAUDE CODE:**

1. **Read this entire prompt carefully** before starting any work
2. **Managing Agent coordinates all activities** - defer to Managing Agent for decisions
3. **Each agent should**:
   - Focus on their assigned responsibilities
   - Use only their assigned MCP servers
   - Communicate through code comments and documentation
   - Request review from appropriate agents
4. **Follow the task breakdown order** unless Managing Agent decides otherwise
5. **Maintain code quality**:
   - Write clean, documented code
   - Follow TypeScript best practices
   - Include error handling
   - Write tests where applicable

### First Steps

\`\`\`
[Managing Agent] START HERE:

1. Initialize project structure using desktop-commander
2. Set up Git repository and push to GitHub
3. Delegate tasks to appropriate agents according to the Task Breakdown
4. Monitor progress and coordinate between agents

Begin execution now!
\`\`\`

---

**⚡ PROJECT GENERATION COMPLETE - START BUILDING! ⚡**`;
  }
}
