import type { APIRoute } from 'astro';
import { ProjectAnalyzer } from '../../lib/analysis';
import type { ProjectConfig, APIResponse, AnalysisResult } from '../../lib/types';
import { mapFeaturesToProjectFeatures } from '../../lib/featureMapping';

/**
 * POST /api/analyze
 *
 * Analyzes project configuration and returns recommended MCPs, agents, and tasks
 *
 * Request Body:
 * - name: string (project name)
 * - description: string (project description)
 * - type: ProjectType (saas, website, api, etc.)
 * - features: ProjectFeature[] (optional)
 * - techStack: TechStack (optional)
 * - metadata: ProjectMetadata (optional)
 *
 * Response:
 * - 200: { success: true, data: AnalysisResult }
 * - 400: { success: false, error: string }
 * - 401: { success: false, error: "Unauthorized" }
 * - 500: { success: false, error: string }
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    console.log('[API /analyze] Request received');

    // Authentication check
    const authToken = cookies.get('auth_token');
    if (authToken?.value !== 'authenticated') {
      console.log('[API /analyze] Authentication failed');
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
    console.log('[API /analyze] Request body:', JSON.stringify(body, null, 2));

    // Validate required fields (accept both formats for flexibility)
    const projectName = body.projectName || body.name;
    const projectDescription = body.description;
    const projectType = body.projectType || body.type;

    console.log('[API /analyze] Extracted fields:', { projectName, projectDescription, projectType });

    if (!projectName || !projectDescription || !projectType) {
      console.log('[API /analyze] Validation failed - missing required fields');
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: projectName/name, description, projectType/type'
      } as APIResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Map feature IDs to ProjectFeature objects using centralized mapping
    const features = mapFeaturesToProjectFeatures(body.features || []);

    // Build tech stack from form data
    const techStack = {
      frontend: body.techStack?.frontend ? [body.techStack.frontend] : [],
      backend: body.techStack?.backend ? [body.techStack.backend] : [],
      database: body.techStack?.database ? [body.techStack.database] : [],
    };

    // Build project config with defaults
    const config: ProjectConfig = {
      name: projectName,
      description: projectDescription,
      type: projectType,
      features: features,
      techStack: techStack,
      metadata: body.metadata || {
        createdAt: new Date(),
        estimatedComplexity: body.estimatedComplexity || 'moderate',
        estimatedDuration: '2-4 weeks',
        teamSize: 3 // Will be dynamically calculated in analyzer
      }
    };

    // Perform analysis (now async with AI-driven MCP recommendations)
    console.log('[API /analyze] Starting analysis with config:', JSON.stringify(config, null, 2));
    const analyzer = new ProjectAnalyzer();
    const analysis: AnalysisResult = await analyzer.analyze(config);
    console.log('[API /analyze] Analysis complete. MCPs:', analysis.recommendedMCPs?.length, 'Agents:', analysis.requiredAgents?.length, 'Tasks:', analysis.taskBreakdown?.length);

    // Return full analysis result (frontend expects 'analysis' key with full AnalysisResult)
    return new Response(JSON.stringify({
      success: true,
      analysis: analysis
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Analysis error:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Analysis failed. Please try again.'
    } as APIResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
