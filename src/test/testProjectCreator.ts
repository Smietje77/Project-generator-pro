import { ProjectCreator } from '../lib/projectCreator';
import type { ProjectConfig } from '../lib/types';

/**
 * Test the project creator with a sample SaaS project
 */
async function testProjectCreation() {
  console.log('🚀 Testing Project Generator Pro...\n');

  const config: ProjectConfig = {
    name: 'Test Task Manager',
    description: 'A collaborative task management application with real-time updates',
    type: 'saas',
    features: [
      {
        id: 'auth',
        name: 'User Authentication',
        category: 'authentication',
        required: true
      },
      {
        id: 'db',
        name: 'Database Storage',
        category: 'database',
        required: true
      },
      {
        id: 'realtime',
        name: 'Real-time Updates',
        category: 'realtime',
        required: true
      }
    ],
    techStack: {
      frontend: ['React', 'TypeScript', 'TailwindCSS'],
      backend: ['Node.js', 'Supabase'],
      database: ['PostgreSQL (Supabase)']
    },
    metadata: {
      createdAt: new Date(),
      estimatedComplexity: 'moderate',
      estimatedDuration: '2-3 weeks',
      teamSize: 2
    }
  };

  try {
    const creator = new ProjectCreator();
    console.log('📁 Creating project...');
    
    const result = await creator.createProject(config);

    if (result.success) {
      console.log('\n✅ Project created successfully!');
      console.log(`📂 Project path: ${result.projectPath}`);
      console.log(`📄 Prompt file: ${result.promptPath}`);
      console.log('\n📋 Generated files:');
      console.log('  - README.md');
      console.log('  - .gitignore');
      console.log('  - package.json');
      console.log('  - .mcp.json');
      console.log('  - .claude/PROJECT_PROMPT.md');
      console.log('  - .claude/STARTER_PROMPT.md');
      console.log('  - .claude/agents/*.md');
    } else {
      console.error('\n❌ Project creation failed:', result.error);
    }
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testProjectCreation();
