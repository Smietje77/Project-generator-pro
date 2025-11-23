import { MCP_DATABASE } from './mcpDatabase';
import { ProjectAnalyzer } from './analysis';
import { PromptGenerator } from './promptGenerator';
import { generateAgentMarkdown } from './agentTemplates';
import { generateMCPConfig } from './mcpConfigGenerator';
import type { ProjectConfig, GeneratedPrompt } from './types';
import path from 'path';
import * as fs from 'fs/promises';

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
    return isWindows ? 'C:\\claude_projects' : '/root/apps/projects';
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
      const analysis = await this.analyzer.analyze(config);

      // 2. Generate Claude Code prompt
      const prompt = this.promptGenerator.generate(analysis);

      // 3. Create project directory structure
      const projectPath = path.join(this.baseProjectPath, this.sanitizeProjectName(config.name));
      
      // 4. Create basic project structure first
      await this.createProjectStructure(projectPath, config);

      // 5. Write prompt file
      const promptPath = path.join(projectPath, '.claude', 'PROJECT_PROMPT.md');
      await fs.writeFile(promptPath, prompt.markdown, 'utf-8');

      // 6. Write starter prompt
      const starterPromptPath = path.join(projectPath, '.claude', 'STARTER_PROMPT.md');
      await fs.writeFile(starterPromptPath, prompt.starterPrompt, 'utf-8');

      // 7. Create agent definition files
      const agentPaths = await this.createAgentFiles(projectPath, analysis.requiredAgents, config.name);

      // 8. Create MCP configuration
      const mcpConfigPath = await this.createMCPConfig(projectPath, analysis.recommendedMCPs);

      // 9. Write README.md
      const readmePath = path.join(projectPath, 'README.md');
      const readmeContent = this.generateReadme(config, analysis);
      await fs.writeFile(readmePath, readmeContent, 'utf-8');

      // 10. Write .gitignore
      const gitignorePath = path.join(projectPath, '.gitignore');
      const gitignoreContent = this.generateGitignore(config);
      await fs.writeFile(gitignorePath, gitignoreContent, 'utf-8');

      // 11. Write package.json (if applicable)
      if (this.needsPackageJson(config)) {
        const packageJsonPath = path.join(projectPath, 'package.json');
        const packageJsonContent = this.generatePackageJson(config);
        await fs.writeFile(packageJsonPath, JSON.stringify(packageJsonContent, null, 2), 'utf-8');
      }

      return {
        success: true,
        projectPath,
        promptPath,
        githubUrl: undefined // Will be created by GitHub MCP in Claude Code
      };

    } catch (error) {
      console.error('[ProjectCreator] Error during project creation:', error);
      return {
        success: false,
        projectPath: '',
        promptPath: '',
        error: error instanceof Error ? `${error.message}\n${error.stack}` : 'Unknown error'
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
  private async createAgentFiles(projectPath: string, agents: any[], projectName: string): Promise<string[]> {
    const paths: string[] = [];
    const agentsDir = path.join(projectPath, '.claude', 'agents');
    
    // Create agents directory
    await fs.mkdir(agentsDir, { recursive: true });
    
    for (const agent of agents) {
      const agentPath = path.join(agentsDir, `${agent.id}-agent.md`);
      const markdown = generateAgentMarkdown(agent, projectName);
      
      await fs.writeFile(agentPath, markdown, 'utf-8');
      paths.push(agentPath);
    }

    return paths;
  }

  /**
   * Create MCP configuration file
   */
  private async createMCPConfig(projectPath: string, mcps: any[]): Promise<string> {
    const configPath = path.join(projectPath, '.mcp.json');
    const claudeDir = path.join(projectPath, '.claude');
    
    // Ensure .claude directory exists
    await fs.mkdir(claudeDir, { recursive: true });
    
    // Generate MCP configuration
    const config = generateMCPConfig(mcps, projectPath, {
      // These would come from environment variables or user input
      githubToken: process.env.GITHUB_TOKEN,
      supabaseProjectRef: process.env.SUPABASE_PROJECT_REF,
      supabaseAccessToken: process.env.SUPABASE_ACCESS_TOKEN
    });

    // Write config file
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
    
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

    // Create all directories
    for (const dir of directories) {
      await fs.mkdir(path.join(projectPath, dir), { recursive: true });
    }
  }

  /**
   * Check if project needs package.json
   */
  private needsPackageJson(config: ProjectConfig): boolean {
    const needsPackage = ['saas', 'website', 'api', 'cli-tool', 'chrome-extension'];
    return needsPackage.includes(config.type);
  }

  /**
   * Generate .gitignore content
   */
  private generateGitignore(config: ProjectConfig): string {
    return `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output/

# Production
dist/
build/
.next/
.nuxt/
.output/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Temporary
.tmp/
temp/
*.tmp

# Claude Code (keep prompt but ignore temp files)
.claude/.tmp/
`;
  }

  /**
   * Generate package.json content
   */
  private generatePackageJson(config: ProjectConfig): any {
    const sanitizedName = this.sanitizeProjectName(config.name);
    
    return {
      name: sanitizedName,
      version: '0.1.0',
      description: config.description,
      type: 'module',
      scripts: {
        dev: 'echo "Configure your dev script"',
        build: 'echo "Configure your build script"',
        start: 'echo "Configure your start script"',
        test: 'echo "Configure your test script"'
      },
      keywords: [],
      author: '',
      license: 'MIT',
      dependencies: {},
      devDependencies: {}
    };
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
