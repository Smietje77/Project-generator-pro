import type { APIRoute } from 'astro';
import { claudeClient } from '../../lib/claudeClient';
import type { APIResponse } from '../../lib/types';

/**
 * POST /api/suggest
 *
 * Generates AI-powered tech stack and feature suggestions based on project details
 *
 * Request Body:
 * - projectName: string (project name)
 * - description: string (project description)
 * - projectType: string (saas, website, api, etc.)
 *
 * Response:
 * - 200: { success: true, data: { features: string[], techStack: {}, reasoning: string } }
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
    const { projectName, description, projectType, discoveryData } = body;

    // Validate required fields
    if (!projectName || !description || !projectType) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: projectName, description, projectType'
      } as APIResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('[AI Suggest] Generating suggestions for:', projectName, discoveryData ? '(with discovery data)' : '');

    // Call Claude AI to generate suggestions
    const suggestions = await claudeClient.generateTechStackSuggestions({
      projectName,
      description,
      projectType,
      discoveryData
    });

    console.log('[AI Suggest] Generated suggestions:', suggestions);

    // Return successful response
    return new Response(JSON.stringify({
      success: true,
      data: suggestions
    } as APIResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[AI Suggest] Error:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate AI suggestions. Please try again.'
    } as APIResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
