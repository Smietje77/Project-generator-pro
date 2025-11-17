import type { MCPServer } from './types';

/**
 * Complete database of available MCP servers with their capabilities
 * and use cases for intelligent matching
 */
export const MCP_DATABASE: MCPServer[] = [
  // ========================================================================
  // FILESYSTEM & PROJECT MANAGEMENT
  // ========================================================================
  {
    id: 'desktop-commander',
    name: 'Desktop Commander',
    description: 'Comprehensive file system operations, terminal access, and process management',
    capabilities: [
      'File read/write/edit operations',
      'Directory management',
      'File search (content and names)',
      'Terminal command execution',
      'Process management',
      'Interactive REPL sessions',
      'Configuration management'
    ],
    useCases: [
      'Project file creation',
      'Code generation',
      'Build automation',
      'Local development tasks',
      'Script execution',
      'Data analysis with Python/Node',
      'File transformations'
    ],
    categories: ['filesystem', 'automation'],
    required: true // Always needed for project creation
  },

  // ========================================================================
  // VERSION CONTROL
  // ========================================================================
  {
    id: 'github',
    name: 'GitHub MCP',
    description: 'Complete GitHub repository management and collaboration',
    capabilities: [
      'Repository creation and management',
      'File operations (CRUD)',
      'Branch management',
      'Pull request workflows',
      'Issue tracking',
      'Code search',
      'Release management',
      'Collaboration features'
    ],
    useCases: [
      'Repository initialization',
      'Code versioning',
      'Team collaboration',
      'CI/CD integration',
      'Project documentation',
      'Issue management',
      'Code review workflows'
    ],
    categories: ['version-control', 'collaboration'],
    required: true // Required for GitHub integration
  },

  // ========================================================================
  // DATABASES & BACKEND
  // ========================================================================
  {
    id: 'supabase',
    name: 'Supabase MCP',
    description: 'PostgreSQL database, authentication, storage, and backend services',
    capabilities: [
      'Database schema management',
      'SQL query execution',
      'Migrations and versioning',
      'Real-time subscriptions',
      'Authentication management',
      'File storage',
      'Edge Functions deployment',
      'Performance monitoring',
      'Row-level security (RLS)'
    ],
    useCases: [
      'Full-stack applications',
      'Real-time apps',
      'User authentication',
      'Data persistence',
      'API backends',
      'File uploads',
      'Serverless functions'
    ],
    categories: ['database', 'backend', 'authentication']
  },

  {
    id: 'airtable',
    name: 'Airtable MCP',
    description: 'No-code database with spreadsheet interface',
    capabilities: [
      'Table/record CRUD operations',
      'Field management',
      'Views and filters',
      'Attachments handling',
      'Collaborative features',
      'API access',
      'Webhooks'
    ],
    useCases: [
      'Rapid prototyping',
      'Content management',
      'Project tracking',
      'CRM systems',
      'Workflow automation',
      'Data collection',
      'Collaborative databases'
    ],
    categories: ['database', 'automation']
  },

  // ========================================================================
  // WEB SCRAPING & DATA COLLECTION
  // ========================================================================
  {
    id: 'apify',
    name: 'Apify MCP',
    description: 'Web scraping, data extraction, and automation platform',
    capabilities: [
      'Actor execution (scrapers)',
      'Dataset management',
      'Web browser automation',
      'API scraping',
      'Data transformation',
      'Scheduled runs',
      'Proxy management'
    ],
    useCases: [
      'Web scraping',
      'Market research',
      'Competitor analysis',
      'Data aggregation',
      'Content monitoring',
      'Lead generation',
      'Price tracking'
    ],
    categories: ['api', 'automation', 'data']
  },

  {
    id: 'chrome-devtools',
    name: 'Chrome DevTools MCP',
    description: 'Browser automation and web application testing',
    capabilities: [
      'Page navigation',
      'Element interaction (click, fill, hover)',
      'Screenshot capture',
      'Network request inspection',
      'Console log access',
      'Performance profiling',
      'CPU/Network throttling',
      'Dialog handling',
      'JavaScript execution'
    ],
    useCases: [
      'E2E testing',
      'Web scraping',
      'UI automation',
      'Performance testing',
      'Visual regression testing',
      'Form automation',
      'Browser-based workflows'
    ],
    categories: ['browser', 'automation', 'testing']
  },

  // ========================================================================
  // AUTOMATION & WORKFLOWS
  // ========================================================================
  {
    id: 'n8n',
    name: 'n8n MCP',
    description: 'Workflow automation and integration platform',
    capabilities: [
      'Workflow creation and execution',
      'Node-based automation',
      'API integrations',
      'Data transformation',
      'Scheduled triggers',
      'Webhook support',
      'Error handling',
      'Template library access'
    ],
    useCases: [
      'API integration',
      'Data synchronization',
      'Event-driven automation',
      'ETL pipelines',
      'Notification systems',
      'Multi-step workflows',
      'Business process automation'
    ],
    categories: ['automation', 'api', 'integration']
  },

  // ========================================================================
  // DOCUMENTATION & KNOWLEDGE
  // ========================================================================
  {
    id: 'context7',
    name: 'Context7 MCP',
    description: 'Documentation search and library information',
    capabilities: [
      'Library documentation lookup',
      'Code examples retrieval',
      'API reference search',
      'Best practices lookup',
      'Framework guides',
      'Technical specifications',
      'Version compatibility checks'
    ],
    useCases: [
      'Learning new libraries',
      'API integration guidance',
      'Framework setup',
      'Troubleshooting',
      'Code implementation examples',
      'Technology research',
      'Documentation generation'
    ],
    categories: ['documentation', 'research']
  },

  // ========================================================================
  // INFRASTRUCTURE & DEPLOYMENT
  // ========================================================================
  {
    id: 'ssh',
    name: 'SSH MCP',
    description: 'Remote server access and management',
    capabilities: [
      'Remote command execution',
      'File transfer',
      'Server configuration',
      'Process management',
      'Log monitoring',
      'Service management',
      'Sudo operations'
    ],
    useCases: [
      'Server deployment',
      'Remote management',
      'Infrastructure automation',
      'Log analysis',
      'Service monitoring',
      'Security audits',
      'Backup operations'
    ],
    categories: ['deployment', 'infrastructure']
  }
];

/**
 * Get MCP servers by category
 */
export function getMCPsByCategory(category: string): MCPServer[] {
  return MCP_DATABASE.filter(mcp => mcp.categories.includes(category as any));
}

/**
 * Get MCP server by ID
 */
export function getMCPById(id: string): MCPServer | undefined {
  return MCP_DATABASE.find(mcp => mcp.id === id);
}

/**
 * Get all required MCP servers
 */
export function getRequiredMCPs(): MCPServer[] {
  return MCP_DATABASE.filter(mcp => mcp.required);
}

/**
 * Search MCPs by keyword
 */
export function searchMCPs(query: string): MCPServer[] {
  const lowerQuery = query.toLowerCase();
  return MCP_DATABASE.filter(mcp =>
    mcp.name.toLowerCase().includes(lowerQuery) ||
    mcp.description.toLowerCase().includes(lowerQuery) ||
    mcp.capabilities.some(cap => cap.toLowerCase().includes(lowerQuery)) ||
    mcp.useCases.some(uc => uc.toLowerCase().includes(lowerQuery))
  );
}
