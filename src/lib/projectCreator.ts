import { MCP_DATABASE } from './mcpDatabase';
import { ProjectAnalyzer } from './analysis';
import { PromptGenerator } from './promptGenerator';
import type { ProjectConfig, GeneratedPrompt } from './types';
import path from 'path';

/**
 * Main orchestrator for project creation
 * Uses Desktop Commander MCP for file operations
 * Uses GitHub MCP for repository creation
 */
export class ProjectCreator {
  private analyzer: ProjectAnalyzer;
  private promptGenerator: PromptGenerator;
  private baseProjectPath: string;

  constructor() {
    this.analyzer = new ProjectAnalyzer();
    this.promptGenerator = new PromptGenerator();
    // Use environment variable, or auto-detect based on platform
    this.baseProjectPath = process.env.CLAUDE_PROJECTS_PATH || this.getDefaultProjectPath();
  }

  /**
   * Get default project path based on platform
   */
  private getDefaultProjectPath(): string {
    // Check if running on Windows or Linux
    const isWindows = process.platform === 'win32';
    return isWindows ? 'E:\\root\\apps\\projects' : '/root/apps/projects';
  }

  /**
   * Main creation workflow
   */
  async createProject(config: ProjectConfig): Promise<{
    success: boolean;
    projectPath: string;
    promptPath: string;
    githubUrl?: string;
    error?: string;
  }> {
    try {
      // 1. Analyze project requirements
      const analysis = this.analyzer.analyze(config);

      // 2. Generate Claude Code prompt
      const prompt = this.promptGenerator.generate(analysis);

      // 3. Create project directory structure
      const projectPath = path.join(this.baseProjectPath, this.sanitizeProjectName(config.name));
      
      // 4. Write prompt file
      const promptPath = path.join(projectPath, '.claude', 'PROJECT_PROMPT.md');

      // 5. Create agent definition files
      const agentPaths = await this.createAgentFiles(projectPath, analysis.requiredAgents);

      // 6. Create MCP configuration
      const mcpConfigPath = await this.createMCPConfig(projectPath, analysis.recommendedMCPs);

      // 7. Create basic project structure
      await this.createProjectStructure(projectPath, config);

      // 8. Write the prompt file
      // NOTE: Actual file operations will be done by Desktop Commander MCP in Claude Code

      return {
        success: true,
        projectPath,
        promptPath,
        githubUrl: undefined // Will be created by GitHub MCP in Claude Code
      };

    } catch (error) {
      return {
        success: false,
        projectPath: '',
        promptPath: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Sanitize project name for filesystem
   */
  private sanitizeProjectName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Create agent definition files
   */
  private async createAgentFiles(projectPath: string, agents: any[]): Promise<string[]> {
    const paths: string[] = [];
    
    for (const agent of agents) {
      const agentPath = path.join(projectPath, '.claude', 'agents', `${agent.id}.md`);
      paths.push(agentPath);
      
      // Content will be written by Desktop Commander in Claude Code
    }

    return paths;
  }

  /**
   * Create MCP configuration file
   */
  private async createMCPConfig(projectPath: string, mcps: any[]): Promise<string> {
    const configPath = path.join(projectPath, '.claude', 'mcp-config.json');
    
    const config = {
      mcpServers: mcps.map(mcp => ({
        id: mcp.id,
        name: mcp.name,
        enabled: true,
        required: mcp.required || false
      })),
      generatedAt: new Date().toISOString()
    };

    // Will be written by Desktop Commander in Claude Code
    return configPath;
  }

  /**
   * Create basic project directory structure
   */
  private async createProjectStructure(projectPath: string, config: ProjectConfig): Promise<void> {
    const directories = [
      '.claude',
      '.claude/agents',
      'src',
      'docs',
      'tests',
      '.github',
      '.github/workflows'
    ];

    // Add project-type specific directories
    switch (config.type) {
      case 'saas':
      case 'website':
        directories.push('src/components', 'src/pages', 'src/lib', 'public');
        break;
      case 'api':
        directories.push('src/routes', 'src/middleware', 'src/models');
        break;
      case 'cli-tool':
        directories.push('src/commands', 'src/utils');
        break;
    }

    // Directories will be created by Desktop Commander in Claude Code
  }

  /**
   * Generate README content
   */
  generateReadme(config: ProjectConfig, analysis: any): string {
    return `# ${config.name}

${config.description}

## Project Type
${config.type.toUpperCase()}

## Features
${config.features.map(f => `- ${f.name}`).join('\n')}

## Tech Stack
${config.techStack.frontend ? `**Frontend:** ${config.techStack.frontend.join(', ')}\n` : ''}${config.techStack.backend ? `**Backend:** ${config.techStack.backend.join(', ')}\n` : ''}${config.techStack.database ? `**Database:** ${config.techStack.database.join(', ')}\n` : ''}

## AI Agents
This project uses ${analysis.requiredAgents.length} AI agents:
${analysis.requiredAgents.map(a => `- **${a.name}**: ${a.role}`).join('\n')}

## MCP Servers
${analysis.recommendedMCPs.map(mcp => `- **${mcp.name}**: ${mcp.description}`).join('\n')}

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Development

This project was generated by **Project Generator Pro**.
See \`.claude/PROJECT_PROMPT.md\` for the complete AI agent instructions.

---

Generated: ${new Date().toISOString()}
`;
  }
}
