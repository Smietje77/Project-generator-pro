import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || import.meta.env.ANTHROPIC_API_KEY || ''
});

/**
 * Anthropic API client wrapper
 */
export class ClaudeClient {
  
  /**
   * Generate enhanced project analysis using Claude
   */
  async analyzeProject(description: string): Promise<{
    suggestedFeatures: string[];
    techRecommendations: Record<string, string[]>;
    complexityEstimate: string;
  }> {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Analyze this project description and provide:
1. Suggested features (list 5-10)
2. Tech stack recommendations (frontend, backend, database)
3. Complexity estimate (simple/moderate/complex/enterprise)

Project: ${description}

Respond in JSON format:
{
  "suggestedFeatures": ["feature1", "feature2", ...],
  "techRecommendations": {
    "frontend": ["tech1", "tech2"],
    "backend": ["tech1", "tech2"],
    "database": ["tech1", "tech2"]
  },
  "complexityEstimate": "moderate"
}`
      }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      try {
        return JSON.parse(content.text);
      } catch {
        // Fallback if JSON parsing fails
        return {
          suggestedFeatures: [],
          techRecommendations: {},
          complexityEstimate: 'moderate'
        };
      }
    }

    throw new Error('Unexpected response format');
  }

  /**
   * Generate tech stack suggestions based on project details
   */
  async generateTechStackSuggestions(input: {
    projectName: string;
    description: string;
    projectType: string;
  }): Promise<{
    features: string[];
    techStack: {
      frontend: string;
      backend: string;
      database: string;
    };
    reasoning: string;
  }> {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Analyze this project and suggest the optimal tech stack and features.

Project Name: ${input.projectName}
Project Type: ${input.projectType}
Description: ${input.description}

Based on this information, determine:

1. Which features to enable from these options:
   - "auth" (Authentication: user login, registration, password reset)
   - "database" (Database: data persistence and queries)
   - "api" (API Routes: RESTful or GraphQL endpoints)
   - "upload" (File Upload: image and file handling)
   - "email" (Email Service: transactional emails)
   - "payment" (Payment Integration: Stripe, PayPal, etc.)
   - "analytics" (Analytics: user tracking and insights)
   - "testing" (Testing Setup: unit and E2E tests)

2. Best frontend framework from: "react", "vue", "astro", "svelte", "next"

3. Best backend runtime from: "node", "bun", "python", "go", "none"
   (Choose "none" only for pure static sites)

4. Best database from: "postgresql", "mysql", "mongodb", "supabase", "none"
   (Choose "none" only if no data persistence needed)

5. Brief reasoning for your recommendations (2-3 sentences)

Respond ONLY with valid JSON in this exact format:
{
  "features": ["feature1", "feature2"],
  "techStack": {
    "frontend": "react",
    "backend": "node",
    "database": "postgresql"
  },
  "reasoning": "Your explanation here"
}`
      }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      try {
        const parsed = JSON.parse(content.text);

        // Validate response structure
        if (!parsed.features || !parsed.techStack || !parsed.reasoning) {
          throw new Error('Invalid response structure');
        }

        return parsed;
      } catch (error) {
        console.error('Failed to parse AI response:', error);
        // Return sensible defaults based on project type
        return this.getDefaultSuggestions(input.projectType);
      }
    }

    throw new Error('Unexpected response format');
  }

  /**
   * Get default suggestions as fallback
   */
  private getDefaultSuggestions(projectType: string): {
    features: string[];
    techStack: { frontend: string; backend: string; database: string };
    reasoning: string;
  } {
    const defaults: Record<string, any> = {
      'saas': {
        features: ['auth', 'database', 'api', 'payment', 'email'],
        techStack: { frontend: 'react', backend: 'node', database: 'postgresql' },
        reasoning: 'Standard SaaS stack with authentication, payments, and database.'
      },
      'website': {
        features: ['api', 'email', 'analytics'],
        techStack: { frontend: 'astro', backend: 'none', database: 'none' },
        reasoning: 'Static website with minimal backend requirements.'
      },
      'api': {
        features: ['database', 'api', 'auth'],
        techStack: { frontend: 'none', backend: 'node', database: 'postgresql' },
        reasoning: 'Backend API with database and authentication.'
      }
    };

    return defaults[projectType] || defaults['saas'];
  }

  /**
   * Recommend MCP servers using AI analysis
   */
  async recommendMCPs(input: {
    projectName: string;
    description: string;
    projectType: string;
    features: string[];
    techStack: {
      frontend?: string[];
      backend?: string[];
      database?: string[];
    };
    availableMCPs: Array<{
      id: string;
      name: string;
      description: string;
      capabilities: string[];
      useCases: string[];
      categories: string[];
    }>;
  }): Promise<Array<{
    id: string;
    required: boolean;
    reasoning: string;
  }>> {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: `You are an expert at analyzing project requirements and recommending the best MCP (Model Context Protocol) servers to enable AI agents to build the project effectively.

PROJECT DETAILS:
Name: ${input.projectName}
Type: ${input.projectType}
Description: ${input.description}

Features: ${input.features.join(', ')}
Tech Stack:
- Frontend: ${input.techStack.frontend?.join(', ') || 'none'}
- Backend: ${input.techStack.backend?.join(', ') || 'none'}
- Database: ${input.techStack.database?.join(', ') || 'none'}

AVAILABLE MCP SERVERS:
${input.availableMCPs.map(mcp => `
${mcp.id}:
  Name: ${mcp.name}
  Description: ${mcp.description}
  Capabilities: ${mcp.capabilities.join(', ')}
  Use Cases: ${mcp.useCases.join(', ')}
  Categories: ${mcp.categories.join(', ')}
`).join('\n')}

TASK:
Analyze the project requirements and select the MINIMUM set of MCP servers needed for AI agents to successfully build this project.

RULES:
1. "desktop-commander" is ALWAYS required (for file operations)
2. "github" is ALWAYS required (for version control)
3. Only recommend database platform MCPs (supabase/airtable) if explicitly mentioned in description OR if the database choice matches
4. Do NOT recommend automation tools (n8n, zapier) unless the project is specifically about automation/workflows
5. Do NOT recommend API testing tools unless explicitly needed
6. Do NOT recommend tools that overlap in functionality
7. Focus on tools that AI agents will ACTUALLY USE during development
8. Mark a server as "required: true" only if the project CANNOT be built without it
9. Mark others as "required: false" (optional enhancements)

Respond ONLY with valid JSON in this exact format:
{
  "recommendations": [
    {
      "id": "mcp-server-id",
      "required": true,
      "reasoning": "Brief explanation why this MCP is needed for THIS specific project"
    }
  ]
}

Be conservative - only recommend what's truly needed. Quality over quantity.`
      }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      try {
        // Clean up response - remove markdown code blocks if present
        let jsonText = content.text.trim();
        if (jsonText.startsWith('```json')) {
          jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const parsed = JSON.parse(jsonText);

        if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
          throw new Error('Invalid response structure');
        }

        return parsed.recommendations;
      } catch (error) {
        console.error('[AI MCP Recommendations] Failed to parse:', error);
        console.error('[AI MCP Recommendations] Raw response:', content.text);
        // Return minimal required MCPs as fallback
        return [
          { id: 'desktop-commander', required: true, reasoning: 'Required for file operations' },
          { id: 'github', required: true, reasoning: 'Required for version control' }
        ];
      }
    }

    throw new Error('Unexpected response format');
  }

  /**
   * Validate generated prompt
   */
  async validatePrompt(prompt: string): Promise<{
    isValid: boolean;
    suggestions: string[];
  }> {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Review this Claude Code prompt and provide:
1. Is it clear and actionable? (true/false)
2. Suggestions for improvement (list)

Prompt:
${prompt.substring(0, 2000)}...

Respond in JSON:
{
  "isValid": true,
  "suggestions": ["suggestion1", "suggestion2"]
}`
      }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      try {
        return JSON.parse(content.text);
      } catch {
        return {
          isValid: true,
          suggestions: []
        };
      }
    }

    throw new Error('Unexpected response format');
  }
}

export const claudeClient = new ClaudeClient();
