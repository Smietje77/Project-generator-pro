/**
 * Centralized file structure generation for consistent project preview
 */

import type { ProjectConfig, AnalysisResult, Agent } from './types';

export interface FileStructureNode {
  name: string;
  type: 'file' | 'folder';
  description?: string;
  content?: string;
  children?: FileStructureNode[];
}

/**
 * Generate file structure for project preview
 * @param config Project configuration
 * @param analysis Analysis results (optional)
 * @returns Array of FileStructureNode objects representing the project structure
 */
export function generateFileStructure(
  config: ProjectConfig,
  analysis?: AnalysisResult
): FileStructureNode[] {
  const sanitizedName = sanitizeProjectName(config.name);

  const structure: FileStructureNode[] = [
    // .claude directory with AI configuration
    {
      name: '.claude',
      type: 'folder',
      description: 'Claude Code configuration',
      children: [
        {
          name: 'PROJECT_PROMPT.md',
          type: 'file',
          description: 'Main project prompt',
          content: '# Generated project prompt will be here...'
        },
        {
          name: 'mcp-config.json',
          type: 'file',
          description: 'MCP server configuration',
          content: JSON.stringify({
            mcpServers: analysis?.recommendedMCPs || []
          }, null, 2)
        },
        {
          name: 'agents',
          type: 'folder',
          description: 'AI agent definitions',
          children: generateAgentFiles(analysis?.requiredAgents || [])
        }
      ]
    },
    // Source code directory
    {
      name: 'src',
      type: 'folder',
      description: 'Source code',
      children: generateSourceFiles(config)
    },
    // Documentation directory
    {
      name: 'docs',
      type: 'folder',
      description: 'Documentation',
      children: []
    },
    // Tests directory
    {
      name: 'tests',
      type: 'folder',
      description: 'Test files',
      children: []
    },
    // Root files
    {
      name: 'README.md',
      type: 'file',
      description: 'Project overview',
      content: generateReadmeContent(config)
    },
    {
      name: 'package.json',
      type: 'file',
      description: 'NPM configuration',
      content: generatePackageJson(config, sanitizedName)
    },
    {
      name: '.gitignore',
      type: 'file',
      description: 'Git ignore rules',
      content: generateGitignore()
    },
    {
      name: '.env.example',
      type: 'file',
      description: 'Environment variables template',
      content: generateEnvExample(config)
    }
  ];

  // Add TypeScript config if using TypeScript
  if (config.techStack.backend?.includes('TypeScript') ||
      config.techStack.frontend?.includes('TypeScript')) {
    structure.push({
      name: 'tsconfig.json',
      type: 'file',
      description: 'TypeScript configuration',
      content: generateTsConfig()
    });
  }

  // Add Docker files if microservice or API
  if (config.type === 'microservice' || config.type === 'api') {
    structure.push({
      name: 'Dockerfile',
      type: 'file',
      description: 'Docker container configuration',
      content: generateDockerfile(config)
    });
    structure.push({
      name: 'docker-compose.yml',
      type: 'file',
      description: 'Docker Compose configuration',
      content: generateDockerCompose(config)
    });
  }

  return structure;
}

/**
 * Sanitize project name for file system
 */
export function sanitizeProjectName(name: string): string {
  return (name || 'project')
    .toLowerCase()
    .replace(/[^a-z0-9-\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Generate agent definition files
 */
function generateAgentFiles(agents: Agent[]): FileStructureNode[] {
  return agents.map(agent => ({
    name: `${agent.id}.md`,
    type: 'file' as const,
    description: agent.role,
    content: `# ${agent.name}\n\n**Role:** ${agent.role}\n\n## Responsibilities\n\n${agent.responsibilities?.map(r => `- ${r}`).join('\n') || ''}`
  }));
}

/**
 * Generate source files based on project type
 */
function generateSourceFiles(config: ProjectConfig): FileStructureNode[] {
  const files: FileStructureNode[] = [];
  const useTypeScript = config.techStack.backend?.includes('TypeScript') ||
                        config.techStack.frontend?.includes('TypeScript');
  const extension = useTypeScript ? '.ts' : '.js';

  // Main entry point
  files.push({
    name: `index${extension}`,
    type: 'file',
    description: 'Main entry point',
    content: generateIndexFile(config, useTypeScript)
  });

  // Add structure based on project type
  if (config.type === 'api' || config.type === 'saas' || config.type === 'webapp') {
    files.push({
      name: 'routes',
      type: 'folder',
      description: 'API routes',
      children: []
    });
    files.push({
      name: 'controllers',
      type: 'folder',
      description: 'Request handlers',
      children: []
    });
    files.push({
      name: 'models',
      type: 'folder',
      description: 'Data models',
      children: []
    });
    files.push({
      name: 'services',
      type: 'folder',
      description: 'Business logic',
      children: []
    });
    files.push({
      name: 'utils',
      type: 'folder',
      description: 'Utility functions',
      children: []
    });
  }

  if (config.type === 'website' || config.type === 'webapp' || config.type === 'saas') {
    files.push({
      name: 'components',
      type: 'folder',
      description: 'UI components',
      children: []
    });
    files.push({
      name: 'styles',
      type: 'folder',
      description: 'CSS/SCSS files',
      children: []
    });
  }

  return files;
}

/**
 * Generate README content
 */
function generateReadmeContent(config: ProjectConfig): string {
  return `# ${config.name}

${config.description}

## Getting Started

Open in Claude Code and let the AI agents build your project!

## Features

${config.features.map(f => `- ${f.name}`).join('\n')}

## Tech Stack

${config.techStack.frontend?.length ? `- **Frontend:** ${config.techStack.frontend.join(', ')}` : ''}
${config.techStack.backend?.length ? `- **Backend:** ${config.techStack.backend.join(', ')}` : ''}
${config.techStack.database?.length ? `- **Database:** ${config.techStack.database.join(', ')}` : ''}

## Development

\`\`\`bash
npm install
npm run dev
\`\`\`

## License

MIT`;
}

/**
 * Generate package.json content
 */
function generatePackageJson(config: ProjectConfig, sanitizedName: string): string {
  const packageObj = {
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
    keywords: [config.type],
    author: '',
    license: 'MIT',
    dependencies: {},
    devDependencies: {}
  };

  return JSON.stringify(packageObj, null, 2);
}

/**
 * Generate .gitignore content
 */
function generateGitignore(): string {
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
.tmp/`;
}

/**
 * Generate .env.example content
 */
function generateEnvExample(config: ProjectConfig): string {
  let envContent = `# Environment Variables
# Copy this file to .env and fill in your values

# General
NODE_ENV=development
PORT=3000

`;

  // Add environment variables based on features
  if (config.features.some(f => f.category === 'database')) {
    envContent += `# Database
DATABASE_URL=
DB_HOST=localhost
DB_PORT=5432
DB_NAME=
DB_USER=
DB_PASSWORD=

`;
  }

  if (config.features.some(f => f.category === 'authentication')) {
    envContent += `# Authentication
JWT_SECRET=
JWT_EXPIRY=7d
SESSION_SECRET=
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=

`;
  }

  if (config.features.some(f => f.category === 'email')) {
    envContent += `# Email Service
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=

`;
  }

  if (config.features.some(f => f.category === 'payments')) {
    envContent += `# Payment Processing
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

`;
  }

  if (config.features.some(f => f.category === 'storage')) {
    envContent += `# File Storage
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
UPLOAD_MAX_SIZE=10485760

`;
  }

  if (config.features.some(f => f.category === 'analytics')) {
    envContent += `# Analytics
GOOGLE_ANALYTICS_ID=
MIXPANEL_TOKEN=

`;
  }

  return envContent;
}

/**
 * Generate index file content
 */
function generateIndexFile(config: ProjectConfig, useTypeScript: boolean): string {
  const header = `/**
 * ${config.name}
 *
 * Generated by Project Generator Pro
 */

`;

  if (config.type === 'api' || config.type === 'microservice') {
    return header + (useTypeScript ?
      `import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});` :
      `const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`);
  }

  return header + `console.log('${config.name} starting...');

// TODO: Implement your application here
// Claude Code agents are ready to help!`;
}

/**
 * Generate TypeScript configuration
 */
function generateTsConfig(): string {
  return JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      module: 'commonjs',
      lib: ['ES2022'],
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      declaration: true,
      declarationMap: true,
      sourceMap: true,
      noImplicitAny: true
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist']
  }, null, 2);
}

/**
 * Generate Dockerfile
 */
function generateDockerfile(config: ProjectConfig): string {
  const nodeVersion = '18-alpine';
  return `FROM node:${nodeVersion}

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build if necessary
# RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]`;
}

/**
 * Generate Docker Compose configuration
 */
function generateDockerCompose(config: ProjectConfig): string {
  const services: any = {
    app: {
      build: '.',
      ports: ['3000:3000'],
      environment: ['NODE_ENV=production'],
      restart: 'unless-stopped'
    }
  };

  // Add database service if needed
  if (config.features.some(f => f.category === 'database')) {
    if (config.techStack.database?.includes('PostgreSQL')) {
      services.postgres = {
        image: 'postgres:14-alpine',
        environment: [
          'POSTGRES_DB=appdb',
          'POSTGRES_USER=appuser',
          'POSTGRES_PASSWORD=changeme'
        ],
        volumes: ['postgres_data:/var/lib/postgresql/data'],
        restart: 'unless-stopped'
      };
    } else if (config.techStack.database?.includes('MongoDB')) {
      services.mongodb = {
        image: 'mongo:6-jammy',
        environment: [
          'MONGO_INITDB_DATABASE=appdb',
          'MONGO_INITDB_ROOT_USERNAME=appuser',
          'MONGO_INITDB_ROOT_PASSWORD=changeme'
        ],
        volumes: ['mongo_data:/data/db'],
        restart: 'unless-stopped'
      };
    }
  }

  // Add Redis if caching is needed
  if (config.type === 'saas' || config.type === 'api') {
    services.redis = {
      image: 'redis:7-alpine',
      restart: 'unless-stopped'
    };
  }

  const compose = {
    version: '3.8',
    services,
    volumes: {}
  };

  if (services.postgres) {
    compose.volumes['postgres_data'] = {};
  }
  if (services.mongodb) {
    compose.volumes['mongo_data'] = {};
  }

  return `version: '3.8'

services:
${Object.entries(services).map(([name, config]) =>
  `  ${name}:\n${Object.entries(config as any).map(([key, value]) =>
    `    ${key}: ${Array.isArray(value) ? '\n' + value.map(v => `      - ${v}`).join('\n') : value}`
  ).join('\n')}`
).join('\n\n')}

${Object.keys(compose.volumes).length > 0 ? `volumes:\n${Object.keys(compose.volumes).map(v => `  ${v}:`).join('\n')}` : ''}`;
}