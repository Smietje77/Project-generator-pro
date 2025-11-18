import type { ProjectConfig, ProjectFeature } from './types';

export interface QuickStartTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  estimatedTime: string; // e.g. "15-30 seconds"
  config: Partial<ProjectConfig>;
  popularity: number; // 1-5 for sorting
  tags: string[];
}

/**
 * Pre-configured templates for rapid project generation
 * These bypass Steps 2-3 and go directly to generation
 */
export const QUICK_START_TEMPLATES: QuickStartTemplate[] = [
  {
    id: 'saas-starter',
    name: 'SaaS Starter Kit',
    icon: '🚀',
    description: 'Full-featured SaaS application with authentication, payments, and admin panel',
    estimatedTime: '15-30 seconds',
    popularity: 5,
    tags: ['saas', 'authentication', 'payments', 'dashboard'],
    config: {
      type: 'saas',
      features: [
        { id: 'auth-oauth', name: 'OAuth Authentication', category: 'authentication', required: true },
        { id: 'payment-stripe', name: 'Stripe Payments', category: 'payment', required: true },
        { id: 'db-postgresql', name: 'PostgreSQL Database', category: 'database', required: true },
        { id: 'ui-admin', name: 'Admin Dashboard', category: 'ui', required: false },
        { id: 'api-rest', name: 'REST API', category: 'api', required: true },
        { id: 'email-sendgrid', name: 'Email Integration', category: 'communication', required: false },
        { id: 'storage-s3', name: 'File Storage', category: 'storage', required: false },
        { id: 'analytics-mixpanel', name: 'Analytics', category: 'analytics', required: false }
      ],
      techStack: {
        frontend: ['Next.js', 'TypeScript', 'Tailwind CSS'],
        backend: ['Node.js', 'Express', 'Prisma'],
        database: ['PostgreSQL', 'Redis']
      },
      metadata: {
        createdAt: new Date(),
        estimatedComplexity: 'moderate',
        estimatedDuration: '2-3 weeks',
        teamSize: 4
      }
    }
  },
  {
    id: 'api-microservice',
    name: 'API Microservice',
    icon: '⚡',
    description: 'Production-ready REST API with authentication, rate limiting, and documentation',
    estimatedTime: '15-20 seconds',
    popularity: 4,
    tags: ['api', 'microservice', 'backend', 'rest'],
    config: {
      type: 'api',
      features: [
        { id: 'auth-jwt', name: 'JWT Authentication', category: 'authentication', required: true },
        { id: 'api-rest', name: 'RESTful Endpoints', category: 'api', required: true },
        { id: 'db-mongodb', name: 'MongoDB Database', category: 'database', required: true },
        { id: 'api-ratelimit', name: 'Rate Limiting', category: 'security', required: true },
        { id: 'api-docs', name: 'Swagger Documentation', category: 'documentation', required: false },
        { id: 'monitoring-prometheus', name: 'Monitoring', category: 'monitoring', required: false },
        { id: 'cache-redis', name: 'Redis Caching', category: 'performance', required: false }
      ],
      techStack: {
        frontend: [],
        backend: ['Node.js', 'Express', 'TypeScript'],
        database: ['MongoDB', 'Redis']
      },
      metadata: {
        createdAt: new Date(),
        estimatedComplexity: 'simple',
        estimatedDuration: '1 week',
        teamSize: 2
      }
    }
  },
  {
    id: 'landing-page',
    name: 'Marketing Landing Page',
    icon: '🎨',
    description: 'Modern landing page with analytics, contact form, and CMS integration',
    estimatedTime: '10-15 seconds',
    popularity: 5,
    tags: ['website', 'landing', 'marketing', 'seo'],
    config: {
      type: 'website',
      features: [
        { id: 'ui-responsive', name: 'Responsive Design', category: 'ui', required: true },
        { id: 'seo-optimization', name: 'SEO Optimization', category: 'marketing', required: true },
        { id: 'analytics-ga', name: 'Google Analytics', category: 'analytics', required: false },
        { id: 'form-contact', name: 'Contact Form', category: 'communication', required: true },
        { id: 'cms-contentful', name: 'CMS Integration', category: 'content', required: false },
        { id: 'animation-framer', name: 'Animations', category: 'ui', required: false }
      ],
      techStack: {
        frontend: ['Astro', 'TypeScript', 'Tailwind CSS'],
        backend: [],
        database: []
      },
      metadata: {
        createdAt: new Date(),
        estimatedComplexity: 'simple',
        estimatedDuration: '3-5 days',
        teamSize: 1
      }
    }
  },
  {
    id: 'ecommerce-store',
    name: 'E-Commerce Store',
    icon: '🛍️',
    description: 'Complete online store with cart, checkout, inventory, and order management',
    estimatedTime: '20-30 seconds',
    popularity: 4,
    tags: ['ecommerce', 'shop', 'payments', 'inventory'],
    config: {
      type: 'saas',
      features: [
        { id: 'cart-checkout', name: 'Shopping Cart', category: 'ecommerce', required: true },
        { id: 'payment-stripe', name: 'Payment Processing', category: 'payment', required: true },
        { id: 'inventory-management', name: 'Inventory System', category: 'ecommerce', required: true },
        { id: 'order-tracking', name: 'Order Management', category: 'ecommerce', required: true },
        { id: 'auth-customers', name: 'Customer Accounts', category: 'authentication', required: true },
        { id: 'search-algolia', name: 'Product Search', category: 'search', required: false },
        { id: 'reviews-ratings', name: 'Reviews System', category: 'social', required: false },
        { id: 'email-notifications', name: 'Email Notifications', category: 'communication', required: false }
      ],
      techStack: {
        frontend: ['Next.js', 'TypeScript', 'Tailwind CSS'],
        backend: ['Node.js', 'Express', 'TypeScript'],
        database: ['PostgreSQL', 'Redis']
      },
      metadata: {
        createdAt: new Date(),
        estimatedComplexity: 'complex',
        estimatedDuration: '3-4 weeks',
        teamSize: 4
      }
    }
  },
  {
    id: 'blog-platform',
    name: 'Blog Platform',
    icon: '📝',
    description: 'Content management system with Markdown support, comments, and SEO',
    estimatedTime: '10-20 seconds',
    popularity: 3,
    tags: ['blog', 'content', 'cms', 'markdown'],
    config: {
      type: 'website',
      features: [
        { id: 'cms-markdown', name: 'Markdown Editor', category: 'content', required: true },
        { id: 'auth-authors', name: 'Author Management', category: 'authentication', required: true },
        { id: 'comments-system', name: 'Comments System', category: 'social', required: false },
        { id: 'seo-optimization', name: 'SEO Features', category: 'marketing', required: true },
        { id: 'rss-feed', name: 'RSS Feed', category: 'content', required: false },
        { id: 'search-posts', name: 'Search Function', category: 'search', required: false }
      ],
      techStack: {
        frontend: ['Astro', 'MDX', 'Tailwind CSS'],
        backend: ['Node.js'],
        database: ['SQLite']
      },
      metadata: {
        createdAt: new Date(),
        estimatedComplexity: 'simple',
        estimatedDuration: '1 week',
        teamSize: 2
      }
    }
  },
  {
    id: 'admin-dashboard',
    name: 'Admin Dashboard',
    icon: '📊',
    description: 'Data visualization dashboard with real-time updates and user management',
    estimatedTime: '15-25 seconds',
    popularity: 4,
    tags: ['dashboard', 'analytics', 'admin', 'charts'],
    config: {
      type: 'saas',
      features: [
        { id: 'charts-visualization', name: 'Data Visualization', category: 'ui', required: true },
        { id: 'realtime-updates', name: 'Real-time Updates', category: 'realtime', required: true },
        { id: 'auth-rbac', name: 'Role-Based Access', category: 'authentication', required: true },
        { id: 'export-reports', name: 'Report Generation', category: 'reporting', required: false },
        { id: 'audit-logs', name: 'Audit Logging', category: 'monitoring', required: false },
        { id: 'notifications', name: 'Notifications System', category: 'communication', required: false }
      ],
      techStack: {
        frontend: ['React', 'TypeScript', 'Material-UI'],
        backend: ['Node.js', 'GraphQL'],
        database: ['PostgreSQL']
      },
      metadata: {
        createdAt: new Date(),
        estimatedComplexity: 'moderate',
        estimatedDuration: '2 weeks',
        teamSize: 3
      }
    }
  },
  {
    id: 'cli-tool',
    name: 'CLI Tool',
    icon: '💻',
    description: 'Command-line tool with interactive prompts and configuration management',
    estimatedTime: '10-15 seconds',
    popularity: 2,
    tags: ['cli', 'tool', 'automation', 'terminal'],
    config: {
      type: 'cli-tool',
      features: [
        { id: 'cli-commands', name: 'Command Structure', category: 'core', required: true },
        { id: 'cli-prompts', name: 'Interactive Prompts', category: 'ui', required: true },
        { id: 'config-management', name: 'Config Files', category: 'configuration', required: true },
        { id: 'cli-colors', name: 'Colored Output', category: 'ui', required: false },
        { id: 'cli-progress', name: 'Progress Bars', category: 'ui', required: false }
      ],
      techStack: {
        frontend: [],
        backend: ['Node.js', 'TypeScript'],
        database: []
      },
      metadata: {
        createdAt: new Date(),
        estimatedComplexity: 'simple',
        estimatedDuration: '3-5 days',
        teamSize: 1
      }
    }
  },
  {
    id: 'mobile-backend',
    name: 'Mobile App Backend',
    icon: '📱',
    description: 'API backend for mobile apps with push notifications and real-time sync',
    estimatedTime: '15-25 seconds',
    popularity: 3,
    tags: ['mobile', 'api', 'backend', 'realtime'],
    config: {
      type: 'api',
      features: [
        { id: 'auth-mobile', name: 'Mobile Authentication', category: 'authentication', required: true },
        { id: 'push-notifications', name: 'Push Notifications', category: 'communication', required: true },
        { id: 'realtime-sync', name: 'Real-time Sync', category: 'realtime', required: true },
        { id: 'file-upload', name: 'File Upload', category: 'storage', required: false },
        { id: 'offline-support', name: 'Offline Support', category: 'performance', required: false },
        { id: 'analytics-mobile', name: 'Mobile Analytics', category: 'analytics', required: false }
      ],
      techStack: {
        frontend: [],
        backend: ['Node.js', 'Socket.io', 'TypeScript'],
        database: ['MongoDB', 'Redis']
      },
      metadata: {
        createdAt: new Date(),
        estimatedComplexity: 'moderate',
        estimatedDuration: '2 weeks',
        teamSize: 3
      }
    }
  }
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): QuickStartTemplate | undefined {
  return QUICK_START_TEMPLATES.find(t => t.id === id);
}

/**
 * Get templates sorted by popularity
 */
export function getPopularTemplates(limit: number = 3): QuickStartTemplate[] {
  return [...QUICK_START_TEMPLATES]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

/**
 * Search templates by tags
 */
export function getTemplatesByTag(tag: string): QuickStartTemplate[] {
  return QUICK_START_TEMPLATES.filter(t =>
    t.tags.some(tTag => tTag.toLowerCase().includes(tag.toLowerCase()))
  );
}

/**
 * Convert template to full ProjectConfig
 */
export function templateToProjectConfig(template: QuickStartTemplate, projectName: string, description: string): ProjectConfig {
  return {
    name: projectName,
    description: description || template.description,
    type: template.config.type!,
    features: template.config.features || [],
    techStack: template.config.techStack || { frontend: [], backend: [], database: [] },
    metadata: {
      ...template.config.metadata!,
      createdAt: new Date(),
      templateUsed: template.id
    }
  };
}