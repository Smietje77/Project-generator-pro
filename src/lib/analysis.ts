import type {
  ProjectConfig,
  AnalysisResult,
  MCPServer,
  Agent,
  Task,
  CollaborationProtocol
} from './types';
import { MCP_DATABASE, getRequiredMCPs } from './mcpDatabase';
import { claudeClient } from './claudeClient';

/**
 * Analyzes project requirements and recommends MCPs and Agents
 */
export class ProjectAnalyzer {
  
  /**
   * Main analysis function (now async for AI-driven MCP recommendations)
   */
  async analyze(config: ProjectConfig): Promise<AnalysisResult> {
    const recommendedMCPs = await this.analyzeMCPs(config);
    const requiredAgents = this.analyzeAgents(config, recommendedMCPs);
    const taskBreakdown = this.generateTaskBreakdown(config, requiredAgents);
    const collaborationProtocol = this.generateCollaborationProtocol(requiredAgents);

    return {
      project: config,
      recommendedMCPs,
      requiredAgents,
      taskBreakdown,
      collaborationProtocol
    };
  }

  /**
   * Analyze and recommend MCP servers using AI-driven analysis
   */
  private async analyzeMCPs(config: ProjectConfig): Promise<MCPServer[]> {
    try {
      console.log('[ProjectAnalyzer] Starting AI-driven MCP recommendation...');

      // Prepare MCP data for AI analysis
      const availableMCPs = MCP_DATABASE.map(mcp => ({
        id: mcp.id,
        name: mcp.name,
        description: mcp.description,
        capabilities: mcp.capabilities || [],
        useCases: mcp.useCases || [],
        categories: mcp.categories || []
      }));

      // Get AI recommendations
      const recommendations = await claudeClient.recommendMCPs({
        projectName: config.name,
        description: config.description,
        projectType: config.type,
        features: config.features.map(f => f.id || f.name || String(f)),
        techStack: config.techStack,
        availableMCPs
      });

      console.log('[ProjectAnalyzer] AI recommendations received:', recommendations);

      // Convert recommendations to MCPServer objects
      const mcpMap = new Map<string, MCPServer>();

      recommendations.forEach(rec => {
        const mcp = MCP_DATABASE.find(m => m.id === rec.id);
        if (mcp) {
          // Add reasoning to the MCP
          mcpMap.set(mcp.id, {
            ...mcp,
            required: rec.required,
            reasoning: rec.reasoning
          });
        }
      });

      const result = Array.from(mcpMap.values());
      console.log('[ProjectAnalyzer] Final MCP list:', result.map(m => m.id));

      return result;

    } catch (error) {
      console.error('[ProjectAnalyzer] AI MCP recommendation failed, using fallback:', error);

      // Fallback to minimal required MCPs
      const mcps = new Set<MCPServer>();
      getRequiredMCPs().forEach(mcp => mcps.add(mcp));

      return Array.from(mcps);
    }
  }

  /**
   * Helper to add MCPs by their IDs
   */
  private addMCPsByIds(set: Set<MCPServer>, ids: string[]): void {
    ids.forEach(id => {
      const mcp = MCP_DATABASE.find(m => m.id === id);
      if (mcp) set.add(mcp);
    });
  }

  /**
   * Analyze and generate required agents
   */
  private analyzeAgents(config: ProjectConfig, mcps: MCPServer[]): Agent[] {
    const agents: Agent[] = [];
    const mcpIds = mcps.map(m => m.id);

    // MANAGING AGENT (Always required)
    agents.push({
      id: 'managing-agent',
      name: 'Managing Agent',
      role: 'Project Orchestrator & Strategic Decision Maker',
      responsibilities: [
        'Coordinate all agents and delegate tasks',
        'Make strategic architectural decisions',
        'Resolve conflicts between agents',
        'Track overall project progress',
        'Ensure code quality standards',
        'Manage project timeline and priorities',
        'Review and approve all major changes'
      ],
      mcpAccess: mcpIds, // Access to all MCPs
      collaboratesWith: [], // Will be filled later
      priority: 'critical'
    });

    // Determine other agents based on project needs
    const needsFrontend = ['saas', 'website', 'mobile-app'].includes(config.type);
    const needsBackend = ['saas', 'api', 'website'].includes(config.type);
    const needsData = config.features.some(f => f.category === 'database');
    const needsSecurity = config.features.some(f => f.category === 'authentication');
    const needsDevOps = config.metadata.estimatedComplexity !== 'simple';
    const needsQA = config.metadata.estimatedComplexity !== 'simple';

    // FRONTEND AGENT
    if (needsFrontend) {
      agents.push({
        id: 'frontend-agent',
        name: 'Frontend Agent',
        role: 'UI/UX Developer',
        responsibilities: [
          'Build responsive user interfaces',
          'Implement component architecture',
          'Handle state management',
          'Optimize frontend performance',
          'Ensure accessibility standards',
          'Integrate with backend APIs',
          'Implement design systems'
        ],
        mcpAccess: ['desktop-commander', 'github', 'chrome-devtools'],
        collaboratesWith: ['managing-agent', 'backend-agent'],
        priority: 'high'
      });
    }

    // BACKEND AGENT
    if (needsBackend) {
      agents.push({
        id: 'backend-agent',
        name: 'Backend Agent',
        role: 'API & Business Logic Developer',
        responsibilities: [
          'Design and implement REST/GraphQL APIs',
          'Develop business logic and services',
          'Handle data validation and processing',
          'Implement authentication and authorization',
          'Optimize database queries',
          'Build scalable architecture',
          'Handle error management'
        ],
        mcpAccess: ['desktop-commander', 'github', 'supabase', 'n8n'].filter(id => mcpIds.includes(id)),
        collaboratesWith: ['managing-agent', 'frontend-agent', 'data-agent'],
        priority: 'high'
      });
    }

    // DATA AGENT
    if (needsData) {
      agents.push({
        id: 'data-agent',
        name: 'Data Agent',
        role: 'Database Architect & Data Engineer',
        responsibilities: [
          'Design optimal database schemas',
          'Create and manage migrations',
          'Implement data seeding strategies',
          'Optimize query performance',
          'Handle data relationships',
          'Implement caching strategies',
          'Ensure data integrity'
        ],
        mcpAccess: ['desktop-commander', 'github', 'supabase', 'airtable'].filter(id => mcpIds.includes(id)),
        collaboratesWith: ['managing-agent', 'backend-agent'],
        priority: 'high'
      });
    }

    // SECURITY AGENT
    if (needsSecurity) {
      agents.push({
        id: 'security-agent',
        name: 'Security Agent',
        role: 'Security & Authentication Specialist',
        responsibilities: [
          'Implement authentication flows',
          'Set up authorization rules',
          'Configure security policies (RLS, CORS)',
          'Handle sensitive data encryption',
          'Implement input validation',
          'Conduct security audits',
          'Manage API keys and secrets'
        ],
        mcpAccess: ['desktop-commander', 'github', 'supabase'].filter(id => mcpIds.includes(id)),
        collaboratesWith: ['managing-agent', 'backend-agent'],
        priority: 'high'
      });
    }

    // QA AGENT
    if (needsQA) {
      agents.push({
        id: 'qa-agent',
        name: 'QA Agent',
        role: 'Quality Assurance & Testing Specialist',
        responsibilities: [
          'Write unit and integration tests',
          'Implement E2E test suites',
          'Perform code reviews',
          'Test edge cases and error scenarios',
          'Ensure code coverage standards',
          'Validate user flows',
          'Report and track bugs'
        ],
        mcpAccess: ['desktop-commander', 'github', 'chrome-devtools'].filter(id => mcpIds.includes(id)),
        collaboratesWith: ['managing-agent'],
        priority: 'medium'
      });
    }

    // DOCUMENTATION AGENT (Always included)
    agents.push({
      id: 'documentation-agent',
      name: 'Documentation Agent',
      role: 'Technical Writer & Documentation Specialist',
      responsibilities: [
        'Write comprehensive README files',
        'Document API endpoints',
        'Create code comments and JSDoc',
        'Write setup and deployment guides',
        'Maintain changelog',
        'Create user documentation',
        'Document architecture decisions'
      ],
      mcpAccess: ['desktop-commander', 'github', 'context7'].filter(id => mcpIds.includes(id)),
      collaboratesWith: ['managing-agent'],
      priority: 'medium'
    });

    // DEVOPS AGENT
    if (needsDevOps) {
      agents.push({
        id: 'devops-agent',
        name: 'DevOps Agent',
        role: 'Deployment & Infrastructure Engineer',
        responsibilities: [
          'Set up CI/CD pipelines',
          'Configure deployment environments',
          'Implement monitoring and logging',
          'Manage infrastructure as code',
          'Optimize build processes',
          'Handle container orchestration',
          'Ensure deployment reliability'
        ],
        mcpAccess: ['desktop-commander', 'github', 'ssh'].filter(id => mcpIds.includes(id)),
        collaboratesWith: ['managing-agent'],
        priority: 'medium'
      });
    }

    // RESEARCH AGENT (For complex projects)
    if (config.metadata.estimatedComplexity === 'complex' || 
        config.metadata.estimatedComplexity === 'enterprise') {
      agents.push({
        id: 'research-agent',
        name: 'Research Agent',
        role: 'Technology Researcher & Advisor',
        responsibilities: [
          'Research best practices and patterns',
          'Evaluate technology choices',
          'Find and recommend libraries',
          'Stay updated on latest developments',
          'Provide technical guidance',
          'Identify potential issues early',
          'Suggest optimizations'
        ],
        mcpAccess: ['desktop-commander', 'context7', 'apify'].filter(id => mcpIds.includes(id)),
        collaboratesWith: ['managing-agent'],
        priority: 'low'
      });
    }

    // Update collaboratesWith for managing agent
    agents[0].collaboratesWith = agents.slice(1).map(a => a.id);

    return agents;
  }

  /**
   * Generate task breakdown for the project
   */
  private generateTaskBreakdown(config: ProjectConfig, agents: Agent[]): Task[] {
    const tasks: Task[] = [];
    let taskId = 1;

    // Phase 1: Foundation
    tasks.push({
      id: `task-${taskId++}`,
      title: 'Initialize Project Structure',
      description: 'Create project directories, initialize git, set up package.json',
      assignedAgent: 'managing-agent',
      dependencies: [],
      estimatedHours: 1,
      priority: 1
    });

    tasks.push({
      id: `task-${taskId++}`,
      title: 'Configure Development Environment',
      description: 'Set up TypeScript, ESLint, Prettier, and other dev tools',
      assignedAgent: 'managing-agent',
      dependencies: ['task-1'],
      estimatedHours: 2,
      priority: 2
    });

    // Phase 2: Backend/Data (if needed)
    if (agents.some(a => a.id === 'data-agent')) {
      tasks.push({
        id: `task-${taskId++}`,
        title: 'Design Database Schema',
        description: 'Define tables, relationships, and constraints',
        assignedAgent: 'data-agent',
        dependencies: ['task-2'],
        estimatedHours: 4,
        priority: 3
      });

      tasks.push({
        id: `task-${taskId++}`,
        title: 'Implement Database Migrations',
        description: 'Create migration files and seed data',
        assignedAgent: 'data-agent',
        dependencies: [`task-${taskId - 1}`],
        estimatedHours: 3,
        priority: 4
      });
    }

    if (agents.some(a => a.id === 'backend-agent')) {
      tasks.push({
        id: `task-${taskId++}`,
        title: 'Build API Endpoints',
        description: 'Implement REST/GraphQL APIs with business logic',
        assignedAgent: 'backend-agent',
        dependencies: agents.some(a => a.id === 'data-agent') ? [`task-${taskId - 1}`] : ['task-2'],
        estimatedHours: 8,
        priority: 5
      });
    }

    // Phase 3: Security
    if (agents.some(a => a.id === 'security-agent')) {
      tasks.push({
        id: `task-${taskId++}`,
        title: 'Implement Authentication',
        description: 'Set up user authentication and authorization',
        assignedAgent: 'security-agent',
        dependencies: agents.some(a => a.id === 'backend-agent') ? [`task-${taskId - 1}`] : ['task-2'],
        estimatedHours: 6,
        priority: 6
      });
    }

    // Phase 4: Frontend
    if (agents.some(a => a.id === 'frontend-agent')) {
      tasks.push({
        id: `task-${taskId++}`,
        title: 'Build UI Components',
        description: 'Create reusable React components and pages',
        assignedAgent: 'frontend-agent',
        dependencies: ['task-2'],
        estimatedHours: 10,
        priority: 7
      });

      tasks.push({
        id: `task-${taskId++}`,
        title: 'Integrate Frontend with Backend',
        description: 'Connect UI to API endpoints and handle state',
        assignedAgent: 'frontend-agent',
        dependencies: [`task-${taskId - 1}`],
        estimatedHours: 6,
        priority: 8
      });
    }

    // Phase 5: Testing
    if (agents.some(a => a.id === 'qa-agent')) {
      tasks.push({
        id: `task-${taskId++}`,
        title: 'Write Test Suites',
        description: 'Implement unit, integration, and E2E tests',
        assignedAgent: 'qa-agent',
        dependencies: [`task-${taskId - 2}`],
        estimatedHours: 8,
        priority: 9
      });
    }

    // Phase 6: Documentation
    tasks.push({
      id: `task-${taskId++}`,
      title: 'Write Documentation',
      description: 'Create README, API docs, and user guides',
      assignedAgent: 'documentation-agent',
      dependencies: [],
      estimatedHours: 4,
      priority: 10
    });

    // Phase 7: Deployment
    if (agents.some(a => a.id === 'devops-agent')) {
      tasks.push({
        id: `task-${taskId++}`,
        title: 'Set Up CI/CD Pipeline',
        description: 'Configure GitHub Actions and deployment',
        assignedAgent: 'devops-agent',
        dependencies: [`task-${taskId - 2}`],
        estimatedHours: 5,
        priority: 11
      });
    }

    return tasks;
  }

  /**
   * Generate collaboration protocol
   */
  private generateCollaborationProtocol(agents: Agent[]): CollaborationProtocol {
    return {
      communicationChannels: [
        'Code comments for implementation details',
        'Git commit messages for change descriptions',
        'Pull request descriptions for feature explanations',
        'Documentation for architectural decisions'
      ],
      reviewProcess: [
        'All code must be reviewed by Managing Agent',
        'Backend changes reviewed by Security Agent',
        'Frontend changes tested by QA Agent',
        'Documentation reviewed by Documentation Agent',
        'No direct commits to main branch'
      ],
      conflictResolution: [
        'Managing Agent makes final decisions',
        'Technical debates resolved through proof-of-concept',
        'Performance concerns validated with benchmarks',
        'Security issues have highest priority'
      ],
      progressTracking: [
        'Daily status updates in commit messages',
        'Task completion logged in project board',
        'Blockers immediately escalated to Managing Agent',
        'Weekly progress summary by Managing Agent'
      ]
    };
  }
}
