import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';

// Response types
interface Question {
  id: string;
  type: 'text' | 'textarea' | 'multiple-choice' | 'checkboxes';
  question: string;
  placeholder?: string;
  options?: string[];
  required: boolean;
  category: 'design' | 'functionality' | 'data' | 'audience' | 'technical' | 'other';
}

interface APIResponse {
  success: boolean;
  data?: {
    questions: Question[];
    reasoning: string;
  };
  error?: string;
}

// Check if API key is available
const hasApiKey = !!import.meta.env.ANTHROPIC_API_KEY;
const anthropic = hasApiKey ? new Anthropic({
  apiKey: import.meta.env.ANTHROPIC_API_KEY,
}) : null;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Authentication check
    const authToken = cookies.get('auth_token');
    if (authToken?.value !== 'authenticated') {
      console.warn('[API:GenerateQuestions] Unauthorized access attempt');
      return new Response(JSON.stringify({
        success: false,
        error: 'Unauthorized. Please refresh the page and try again.'
      } as APIResponse), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if AI features are available
    if (!anthropic) {
      console.warn('[API:GenerateQuestions] API key not configured');
      return new Response(JSON.stringify({
        success: false,
        error: 'AI features are not available. Please configure ANTHROPIC_API_KEY to enable AI-powered discovery questions.'
      } as APIResponse), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    let body: any;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('[API:GenerateQuestions] Failed to parse request body:', parseError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid request format.'
      } as APIResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { projectName, description, projectType } = body;

    // Validate required fields
    if (!projectName || !description || !projectType) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: projectName, description, or projectType.'
      } as APIResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`[API:GenerateQuestions] Generating questions for: "${projectName}" (${projectType})`);

    // Generate questions using Claude Haiku
    const prompt = `You are an expert product manager and software architect conducting a discovery interview.

PROJECT INFORMATION:
- Name: ${projectName}
- Type: ${projectType}
- Description: ${description}

YOUR TASK:
Analyze this project description and generate 3-10 intelligent, targeted questions to gather missing information that will improve the final project. Focus on:

1. **Design & UX**: Colors, branding, layout preferences, user experience
2. **Functionality**: Core features, workflows, user interactions, edge cases
3. **Data & Database**: Data models, relationships, storage needs
4. **Target Audience**: Who will use this, their needs, technical level
5. **Technical Details**: Integrations, APIs, performance requirements

QUESTION TYPES:
- **text**: Short answer (1-2 words, like a name or URL)
- **textarea**: Long answer (descriptions, requirements, lists)
- **multiple-choice**: Single selection from options (choose one)
- **checkboxes**: Multiple selections (choose many)

GUIDELINES:
- Generate 3-10 questions (more for complex projects, fewer for simple ones)
- Only ask questions where the answer will meaningfully improve the project
- Avoid questions already answered in the description
- Make questions specific and actionable
- Provide helpful placeholders and realistic options
- Prioritize the most impactful questions first

OUTPUT FORMAT (JSON):
{
  "reasoning": "Brief explanation of why these questions matter",
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice",
      "question": "What is your primary color scheme preference?",
      "options": ["Modern & Minimal (Blue/Gray)", "Vibrant & Energetic (Purple/Orange)", "Professional (Navy/White)", "Custom"],
      "required": true,
      "category": "design"
    },
    {
      "id": "q2",
      "type": "textarea",
      "question": "Describe the main user workflow from start to finish:",
      "placeholder": "Example: User signs up → Creates profile → Browses items → Makes purchase...",
      "required": true,
      "category": "functionality"
    }
  ]
}

Generate only valid JSON. No markdown, no code blocks, just the JSON object.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4096,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse the JSON response
    let parsedResponse: { reasoning: string; questions: Question[] };
    try {
      // Remove any markdown code blocks if present
      const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResponse = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('[API:GenerateQuestions] Failed to parse AI response:', responseText);
      throw new Error('AI returned invalid response format');
    }

    // Validate questions structure
    if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
      throw new Error('Invalid questions array in AI response');
    }

    // Ensure all questions have required fields
    const validatedQuestions = parsedResponse.questions.map((q, index) => ({
      id: q.id || `q${index + 1}`,
      type: q.type || 'textarea',
      question: q.question,
      placeholder: q.placeholder,
      options: q.options,
      required: q.required !== false, // Default to true
      category: q.category || 'other'
    }));

    console.log(`[API:GenerateQuestions] ✅ Generated ${validatedQuestions.length} questions successfully`);

    return new Response(JSON.stringify({
      success: true,
      data: {
        questions: validatedQuestions,
        reasoning: parsedResponse.reasoning || 'Questions generated to improve your project'
      }
    } as APIResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[API:GenerateQuestions] ❌ Error:', error);

    let errorMessage = 'Failed to generate questions. Please try again.';
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'AI service configuration error. Please contact support.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      }
    }

    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    } as APIResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
