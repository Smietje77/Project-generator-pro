import { ProjectCreator } from '../lib/projectCreator';
import type { ProjectConfig } from '../lib/types';

async function debugTest() {
  console.log('🔍 Debug Test Starting...\n');

  const config: ProjectConfig = {
    name: 'Debug Test Project',
    description: 'Testing project creation',
    type: 'api',
    features: [{
      id: 'auth',
      name: 'Authentication',
      category: 'authentication',
      required: true
    }],
    techStack: {
      backend: ['Node.js']
    },
    metadata: {
      createdAt: new Date(),
      estimatedComplexity: 'simple',
      estimatedDuration: '1 week',
      teamSize: 1
    }
  };

  try {
    const creator = new ProjectCreator();
    console.log('✓ Creator instantiated');

    const result = await creator.createProject(config);

    console.log('✓ Result:', JSON.stringify(result, null, 2));

    if (!result.success) {
      console.error('❌ Error:', result.error);
    }

  } catch (error: any) {
    console.error('❌ Exception caught:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugTest();
