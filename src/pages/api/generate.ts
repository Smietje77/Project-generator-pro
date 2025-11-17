import type { APIRoute } from 'astro';
import { ProjectAnalyzer } from '../../lib/analysis';
import { PromptGenerator } from '../../lib/promptGenerator';
import type { ProjectConfig, APIResponse, Agent, MCPServer, ProjectFeature } from '../../lib/types';
import { mapFeaturesToProjectFeatures } from '../../lib/featureMapping';
import * as fs from 'fs';
import * as path from 'path';

/**
 * POST /api/generate
 *
 * Generates complete project structure with Desktop Commander MCP
 *
 * Request Body:
 * - config: ProjectConfig (project configuration)
 * - customizations: any (optional customizations from step 3)
 *
 * Response:
 * - 200: { success: true, data: { projectPath, promptPath } }
 * - 400: { success: false, error: string }
 * - 401: { success: false, error: "Unauthorized" }
 * - 500: { success: false, error: string }
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Authentication check
    const authToken = cookies.get('auth_token');
    if (authToken?.value !== 'authenticated') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Unauthorized'
      } as APIResponse), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    const body = await request.json();
    const { config: rawConfig, analysis: requestAnalysis } = body;

    // Build proper ProjectConfig from request data using centralized feature mapping
    const features: ProjectFeature[] = mapFeaturesToProjectFeatures(rawConfig.features || []);

    const config: ProjectConfig = {
      name: rawConfig.projectName || rawConfig.name,
      description: rawConfig.description,
      type: rawConfig.projectType || rawConfig.type,
      features: features,
      techStack: {
        frontend: rawConfig.techStack?.frontend ? [rawConfig.techStack.frontend] : [],
        backend: rawConfig.techStack?.backend ? [rawConfig.techStack.backend] : [],
        database: rawConfig.techStack?.database ? [rawConfig.techStack.database] : [],
      },
      metadata: rawConfig.metadata || {
        createdAt: new Date(),
        estimatedComplexity: 'moderate',
        estimatedDuration: '2-4 weeks',
        teamSize: 3
      }
    };

    // Validate config
    if (!config || !config.name) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing project configuration'
      } as APIResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Sanitize project name for file system (remove special chars, spaces -> hyphens)
    const sanitizedName = config.name
      .toLowerCase()
      .replace(/[^a-z0-9-\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    if (!sanitizedName) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid project name'
      } as APIResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Step 1: Analyze project (always analyze from scratch to ensure consistency)
    const analyzer = new ProjectAnalyzer();
    const analysisResult = await analyzer.analyze(config);

    // Step 2: Generate prompt
    const promptGen = new PromptGenerator();
    const generatedPrompt = promptGen.generate(analysisResult);

    // Step 3: Create project directory structure
    const projectPath = path.join('C:', 'claude_projects', sanitizedName);

    try {
      // Create main directory
      fs.mkdirSync(projectPath, { recursive: true });

      // Create subdirectories
      const directories = [
        path.join(projectPath, '.claude'),
        path.join(projectPath, '.claude', 'agents'),
        path.join(projectPath, 'src'),
        path.join(projectPath, 'docs'),
        path.join(projectPath, 'tests')
      ];

      directories.forEach(dir => {
        fs.mkdirSync(dir, { recursive: true });
      });
    } catch (error) {
      console.error('Directory creation error:', error);
      throw new Error('Failed to create project directories');
    }

    try {
      // Write PROJECT_PROMPT.md
      const promptPath = path.join(projectPath, '.claude', 'PROJECT_PROMPT.md');
      fs.writeFileSync(promptPath, generatedPrompt.markdown, 'utf-8');

      // Write agent definition files
      analysisResult.requiredAgents.forEach((agent: Agent) => {
        const agentContent = buildAgentMarkdown(agent);
        const agentPath = path.join(projectPath, '.claude', 'agents', `${agent.id}.md`);
        fs.writeFileSync(agentPath, agentContent, 'utf-8');
      });

      // Write MCP configuration
      const mcpConfig = {
        mcpServers: analysisResult.recommendedMCPs.map((mcp: MCPServer) => ({
          id: mcp.id,
          name: mcp.name,
          required: mcp.required || mcp.id === 'desktop-commander' || mcp.id === 'github',
          enabled: true,
          description: mcp.description,
          capabilities: mcp.capabilities
        }))
      };
      const mcpConfigPath = path.join(projectPath, '.claude', 'mcp-config.json');
      fs.writeFileSync(mcpConfigPath, JSON.stringify(mcpConfig, null, 2), 'utf-8');

      // Write README.md
      const readme = buildReadme(config, sanitizedName);
      const readmePath = path.join(projectPath, 'README.md');
      fs.writeFileSync(readmePath, readme, 'utf-8');

      // Write package.json
      const packageJson = buildPackageJson(config, sanitizedName);
      const packagePath = path.join(projectPath, 'package.json');
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2), 'utf-8');

      // Write .gitignore
      const gitignore = buildGitignore();
      const gitignorePath = path.join(projectPath, '.gitignore');
      fs.writeFileSync(gitignorePath, gitignore, 'utf-8');

      // Write .env.example
      const envExample = buildEnvExample(config);
      const envPath = path.join(projectPath, '.env.example');
      fs.writeFileSync(envPath, envExample, 'utf-8');

      // Write initial src/index file
      const indexContent = buildIndexFile(config);
      const indexExtension = getIndexExtension(config);
      const indexPath = path.join(projectPath, 'src', `index${indexExtension}`);
      fs.writeFileSync(indexPath, indexContent, 'utf-8');

    } catch (error) {
      console.error('File write error:', error);
      throw new Error('Failed to write project files');
    }

    // Return successful response with prompt and project info
    return new Response(JSON.stringify({
      success: true,
      data: {
        projectPath,
        promptPath: path.join(projectPath, '.claude', 'PROJECT_PROMPT.md'),
        sanitizedName,
        prompt: generatedPrompt.markdown, // The generated prompt for display
        analysis: {
          totalAgents: analysisResult.requiredAgents.length,
          totalMCPs: analysisResult.recommendedMCPs.length,
          totalTasks: analysisResult.taskBreakdown.length
        }
      }
    } as APIResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Generation error:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Project generation failed. Please try again.'
    } as APIResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * Build agent markdown content
 */
function buildAgentMarkdown(agent: Agent): string {
  const priorityEmoji = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🟢'
  }[agent.priority];

  return `# ${agent.name}

**Role:** ${agent.role}

**Priority:** ${priorityEmoji} ${agent.priority.toUpperCase()}

## Responsibilities

${agent.responsibilities.map(r => `- ${r}`).join('\n')}

## MCP Access

${agent.mcpAccess.map(m => `- \`${m}\``).join('\n')}

## Collaborates With

${agent.collaboratesWith.length > 0
  ? agent.collaboratesWith.map(c => `- ${c}`).join('\n')
  : '- Works independently'
}

## Success Criteria

${agent.responsibilities.map(r => `- Successfully completed: ${r}`).join('\n')}

---

**Generated by Project Generator Pro**
**Date:** ${new Date().toISOString()}
`;
}

/**
 * Build README.md content
 */
function buildReadme(config: ProjectConfig, sanitizedName: string): string {
  return `# ${config.name}

${config.description}

## Project Information

- **Type:** ${config.type}
- **Complexity:** ${config.metadata.estimatedComplexity}
- **Estimated Duration:** ${config.metadata.estimatedDuration}
- **Team Size:** ${config.metadata.teamSize} AI Agents

## Features

${config.features.map(f => `- **${f.name}** (${f.category})`).join('\n') || '- To be defined'}

## Tech Stack

${config.techStack.frontend ? `**Frontend:** ${config.techStack.frontend.join(', ')}` : ''}
${config.techStack.backend ? `**Backend:** ${config.techStack.backend.join(', ')}` : ''}
${config.techStack.database ? `**Database:** ${config.techStack.database.join(', ')}` : ''}

## Getting Started

1. **Open in Claude Code**
   \`\`\`bash
   cd ${sanitizedName}
   \`\`\`

2. **Review the project prompt**
   - Open \`.claude/PROJECT_PROMPT.md\`
   - Read agent definitions in \`.claude/agents/\`
   - Check MCP configuration in \`.claude/mcp-config.json\`

3. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

4. **Start development**
   \`\`\`bash
   npm run dev
   \`\`\`

## Project Structure

\`\`\`
${sanitizedName}/
├── .claude/
│   ├── PROJECT_PROMPT.md    # Main project prompt for Claude Code
│   ├── agents/              # Individual agent definitions
│   └── mcp-config.json      # MCP server configuration
├── src/                     # Source code
├── docs/                    # Documentation
├── tests/                   # Test files
├── README.md
├── package.json
└── .gitignore
\`\`\`

## AI Agents

This project uses ${config.metadata.teamSize} specialized AI agents:
- Managing Agent (coordinates all activities)
- Additional agents based on project requirements

See \`.claude/agents/\` for detailed agent definitions.

## Next Steps

1. Review and customize the generated prompt
2. Let Claude Code agents start building!
3. Monitor progress and provide feedback
4. Test and iterate

---

**Generated by Project Generator Pro**
**Date:** ${new Date().toISOString()}
**Generated at:** https://project.n8naccess.xyz
`;
}

/**
 * Build package.json content
 */
function buildPackageJson(config: ProjectConfig, sanitizedName: string): any {
  const basePackage = {
    name: sanitizedName,
    version: '0.1.0',
    description: config.description,
    type: 'module',
    scripts: {
      dev: 'echo "Setup your dev script here"',
      build: 'echo "Setup your build script here"',
      start: 'echo "Setup your start script here"',
      test: 'echo "Setup your test script here"'
    },
    keywords: [config.type, 'generated-project'],
    author: '',
    license: 'MIT'
  };

  return basePackage;
}

/**
 * Build .gitignore content
 */
function buildGitignore(): string {
  return `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
*.log

# Production
dist/
build/
.output/

# Environment
.env
.env.local
.env.production
.env.development
*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
desktop.ini

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Misc
*.tgz
.cache/
.temp/
.tmp/
`;
}

/**
 * Build .env.example content
 */
function buildEnvExample(config: ProjectConfig): string {
  let envContent = `# Environment Variables
# Copy this file to .env and fill in your values

# General
NODE_ENV=development

`;

  // Add environment variables based on features
  if (config.features.some(f => f.category === 'database')) {
    envContent += `# Database
DATABASE_URL=
`;
  }

  if (config.features.some(f => f.category === 'authentication')) {
    envContent += `
# Authentication
JWT_SECRET=
AUTH_PROVIDER_KEY=
`;
  }

  if (config.features.some(f => f.category === 'ai')) {
    envContent += `
# AI Services
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
`;
  }

  return envContent;
}

/**
 * Build initial index file
 */
function buildIndexFile(config: ProjectConfig): string {
  if (config.type === 'api') {
    return `/**
 * ${config.name} - API Server
 *
 * Generated by Project Generator Pro
 */

console.log('${config.name} API starting...');

// TODO: Implement your API server here
// The Backend Agent will help you build this!
`;
  }

  return `/**
 * ${config.name}
 *
 * Generated by Project Generator Pro
 */

console.log('${config.name} starting...');

// TODO: Implement your application here
// Claude Code agents are ready to help!
`;
}

/**
 * Get file extension based on project type
 */
function getIndexExtension(config: ProjectConfig): string {
  if (config.techStack.backend?.includes('TypeScript')) {
    return '.ts';
  }
  return '.js';
}
