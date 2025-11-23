import type { MCPServer } from './types';
import path from 'path';

/**
 * MCP Server configuration interfaces
 */
interface MCPServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

interface MCPConfig {
  mcpServers: Record<string, MCPServerConfig>;
}

/**
 * Generate .mcp.json configuration for a project
 * Based on the subscription-manager-pro example
 */
export function generateMCPConfig(
  mcpServers: MCPServer[],
  projectPath: string,
  options: {
    githubToken?: string;
    supabaseProjectRef?: string;
    supabaseAccessToken?: string;
    sshHost?: string;
    sshPort?: number;
    sshUser?: string;
    sshKeyPath?: string;
  } = {}
): MCPConfig {
  const config: MCPConfig = {
    mcpServers: {}
  };

  // Always include core MCPs
  const mcpIds = new Set(mcpServers.map(mcp => mcp.id));

  // Desktop Commander (always required)
  if (mcpIds.has('desktop-commander')) {
    config.mcpServers['desktop-commander'] = {
      command: 'cmd',
      args: ['/c', 'npx', '-y', '@wonderwhy-er/desktop-commander'],
      env: {
        ALLOWED_DIRECTORIES: projectPath
      }
    };
  }

  // GitHub MCP
  if (mcpIds.has('github') && options.githubToken) {
    config.mcpServers['github'] = {
      command: 'cmd',
      args: ['/c', 'npx', '-y', '@modelcontextprotocol/server-github'],
      env: {
        GITHUB_PERSONAL_ACCESS_TOKEN: options.githubToken
      }
    };
  }

  // Supabase MCP
  if (mcpIds.has('supabase') && options.supabaseProjectRef && options.supabaseAccessToken) {
    config.mcpServers['supabase'] = {
      command: 'cmd',
      args: [
        '/c',
        'npx',
        '-y',
        '@supabase/mcp-server-supabase',
        `--project-ref=${options.supabaseProjectRef}`
      ],
      env: {
        SUPABASE_ACCESS_TOKEN: options.supabaseAccessToken
      }
    };
  }

  // Context7 MCP (documentation)
  if (mcpIds.has('context7')) {
    config.mcpServers['context7'] = {
      command: 'cmd',
      args: ['/c', 'npx', '-y', '@upstash/context7-mcp']
    };
  }

  // Memory MCP
  if (mcpIds.has('memory')) {
    config.mcpServers['memory'] = {
      command: 'cmd',
      args: ['/c', 'npx', '-y', '@modelcontextprotocol/server-memory']
    };
  }

  // Agents MCP - altijd toevoegen met correcte node command
  const agentsDir = path.join(projectPath, '.claude', 'agents').replace(/\\/g, '\\\\');

  config.mcpServers['agents'] = {
    command: 'node',
    args: ['C:\\Users\\bjorn\\agents-mcp-server\\index.js'],
    env: {
      AGENTS_DIR: agentsDir
    }
  };

  // Chrome DevTools MCP (for browser automation)
  if (mcpIds.has('chrome-devtools')) {
    config.mcpServers['chrome-devtools'] = {
      command: 'cmd',
      args: ['/c', 'npx', '-y', 'chrome-devtools-mcp']
    };
  }

  // SSH MCP
  if (mcpIds.has('ssh') && options.sshHost && options.sshUser) {
    const sshArgs = [
      '/c',
      'npx',
      '-y',
      'ssh-mcp',
      '--',
      `--host=${options.sshHost}`,
      `--user=${options.sshUser}`
    ];

    if (options.sshPort) {
      sshArgs.push(`--port=${options.sshPort}`);
    }

    if (options.sshKeyPath) {
      sshArgs.push(`--key=${options.sshKeyPath}`);
    }

    config.mcpServers['ssh'] = {
      command: 'cmd',
      args: sshArgs
    };
  }

  return config;
}
