import Anthropic from '@anthropic-ai/sdk';

/**
 * Anthropic API client wrapper
 */
export class ClaudeClient {
  private client: Anthropic | null = null;

  /**
   * Get or create Anthropic client instance
   * This is lazy-initialized to ensure we read process.env at runtime, not build time
   */
  private getClient(): Anthropic {
    if (!this.client) {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      
      if (!apiKey) {
        console.error('[ClaudeClient] CRITICAL: ANTHROPIC_API_KEY not found in process.env');
        console.error('[ClaudeClient] Available env keys:', Object.keys(process.env).join(', '));
        throw new Error('ANTHROPIC_API_KEY is not configured');
      }

      console.log('[ClaudeClient] Initializing with API key:', apiKey.substring(0, 15) + '...');
      this.client = new Anthropic({ apiKey });
    }
    return this.client;
  }
  
  /**
   * Generate enhanced project analysis using Claude
   */
  async analyzeProject(description: string): Promise<{
    suggestedFeatures: string[];
    techRecommendations: Record<string, string[]>;
    complexityEstimate: string;
  }> {
    const response = await this.getClient().messages.create({
      model: 'claude-3-5-haiku-20241022', // Using Haiku for speed
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Analyze: ${description.substring(0, 300)}

List 5 features, tech stacks, and complexity (simple/moderate/complex).

CRITICAL: OUTPUT ONLY THE JSON, NO EXPLANATIONS OR TEXT BEFORE/AFTER!

JSON: {"suggestedFeatures": ["f1","f2"], "techRecommendations": {"frontend": ["t1"], "backend": ["t2"], "database": ["t3"]}, "complexityEstimate": "moderate"}`
      }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      try {
        // Extract JSON from response (handle cases where Haiku adds text)
        const jsonText = this.extractJSON(content.text);
        return JSON.parse(jsonText);
      } catch (error) {
        console.error('[AI Analysis] Failed to parse:', error);
        console.error('[AI Analysis] Raw response:', content.text);
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
    discoveryData?: any;
  }): Promise<{
    features: string[];
    techStack: {
      frontend: string;
      backend: string;
      database: string;
    };
    reasoning: string;
  }> {
    // Build prompt with optional discovery data
    let prompt = `Features & stack for ${input.projectType}: ${input.description.substring(0, 200)}`;

    // Add discovery insights if available
    if (input.discoveryData && input.discoveryData.answers) {
      prompt += '\n\nADDITIONAL PROJECT INSIGHTS:';
      const { questions, answers } = input.discoveryData;

      questions.forEach((q: any) => {
        const answer = answers[q.id];
        if (answer) {
          const answerText = Array.isArray(answer) ? answer.join(', ') : answer;
          prompt += `\n- ${q.question}: ${answerText}`;
        }
      });
    }

    prompt += `

Pick from: auth, database, api, upload, email, payment, analytics, testing
Frontend: react/vue/astro/svelte/next
Backend: node/bun/python/go/none
Database: postgresql/mysql/mongodb/supabase/none

CRITICAL: OUTPUT ONLY THE JSON, NO EXPLANATIONS OR TEXT BEFORE/AFTER!

JSON: {"features": ["f1","f2"], "techStack": {"frontend": "x", "backend": "y", "database": "z"}, "reasoning": "why"}`;

    const response = await this.getClient().messages.create({
      model: 'claude-3-5-haiku-20241022', // Using Haiku for faster suggestions
      max_tokens: 1000, // Reduced for faster response
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      try {
        // Extract JSON from response (handle cases where Haiku adds text)
        const jsonText = this.extractJSON(content.text);
        const parsed = JSON.parse(jsonText);

        // Validate response structure
        if (!parsed.features || !parsed.techStack || !parsed.reasoning) {
          throw new Error('Invalid response structure');
        }

        return parsed;
      } catch (error) {
        console.error('[AI Tech Stack] Failed to parse:', error);
        console.error('[AI Tech Stack] Raw response:', content.text);
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
    const response = await this.getClient().messages.create({
      model: 'claude-3-5-haiku-20241022', // Using Haiku for 3x faster response time
      max_tokens: 2000, // Reduced from 3000 for faster response
      messages: [{
        role: 'user',
        content: `Select MCP servers for: ${input.projectType} project with ${input.features.slice(0, 3).join(', ')}

AVAILABLE:
${input.availableMCPs.slice(0, 12).map(mcp => `${mcp.id}: ${mcp.description.substring(0, 80)}`).join('\n')}

RULES:
- Always include: desktop-commander, github
- Only add database MCPs if database is in tech stack
- Be minimal - only recommend what's essential

CRITICAL: OUTPUT ONLY THE JSON, NO EXPLANATIONS OR TEXT BEFORE/AFTER!

JSON format:
{"recommendations": [{"id": "mcp-id", "required": true/false, "reasoning": "why needed"}]}`
      }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      try {
        // Extract JSON from response (handle cases where Haiku adds text)
        const jsonText = this.extractJSON(content.text);
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
    const response = await this.getClient().messages.create({
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

  /**
   * Extract JSON from text that might have explanations before/after
   * Handles cases where Haiku adds text like "Based on... {JSON}"
   */
  private extractJSON(text: string): string {
    // Remove markdown code blocks if present
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Find first { or [ and last } or ]
    const firstBrace = Math.min(
      cleaned.indexOf('{') === -1 ? Infinity : cleaned.indexOf('{'),
      cleaned.indexOf('[') === -1 ? Infinity : cleaned.indexOf('[')
    );

    const lastBrace = Math.max(
      cleaned.lastIndexOf('}'),
      cleaned.lastIndexOf(']')
    );

    if (firstBrace === Infinity || lastBrace === -1) {
      // No JSON found, return original text and let it fail
      return cleaned;
    }

    // Extract the JSON portion
    const jsonText = cleaned.substring(firstBrace, lastBrace + 1);
    return jsonText;
  }
}

export const claudeClient = new ClaudeClient();
