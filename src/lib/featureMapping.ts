/**
 * Centralized feature mapping for consistent ProjectFeature types across the application
 */

import type { ProjectFeature } from './types';

export interface FeatureDefinition {
  id: string;
  name: string;
  category: 'authentication' | 'database' | 'storage' | 'email' | 'payments' | 'analytics' | 'automation' | 'ai';
  description?: string;
  dependencies?: string[]; // Other feature IDs this feature depends on
  techRequirements?: string[]; // Required tech stack elements
}

/**
 * Master feature definitions - single source of truth
 */
export const FEATURE_DEFINITIONS: Record<string, FeatureDefinition> = {
  'auth': {
    id: 'auth',
    name: 'Authentication',
    category: 'authentication',
    description: 'User authentication and authorization system',
    techRequirements: ['backend']
  },
  'database': {
    id: 'database',
    name: 'Database',
    category: 'database',
    description: 'Database integration and ORM setup',
    techRequirements: ['backend']
  },
  'api': {
    id: 'api',
    name: 'API Routes',
    category: 'database',
    description: 'RESTful API endpoints',
    dependencies: ['database'],
    techRequirements: ['backend']
  },
  'upload': {
    id: 'upload',
    name: 'File Upload',
    category: 'storage',
    description: 'File upload and storage functionality',
    techRequirements: ['backend']
  },
  'email': {
    id: 'email',
    name: 'Email Service',
    category: 'email',
    description: 'Email sending and notification system'
  },
  'payment': {
    id: 'payment',
    name: 'Payment Integration',
    category: 'payments',
    description: 'Payment processing and subscription management',
    techRequirements: ['backend']
  },
  'analytics': {
    id: 'analytics',
    name: 'Analytics',
    category: 'analytics',
    description: 'User analytics and metrics tracking'
  },
  'testing': {
    id: 'testing',
    name: 'Testing Setup',
    category: 'automation',
    description: 'Automated testing framework and CI/CD'
  }
};

/**
 * Convert feature IDs to ProjectFeature objects
 * @param featureIds Array of feature ID strings
 * @returns Array of ProjectFeature objects
 */
export function mapFeaturesToProjectFeatures(featureIds: string[] | any[]): ProjectFeature[] {
  console.log('[featureMapping] Input featureIds:', featureIds);
  console.log('[featureMapping] Input type:', typeof featureIds, 'isArray:', Array.isArray(featureIds));

  // Normalize input - handle both strings and objects
  const normalizedIds = featureIds.map((item: any) => {
    if (typeof item === 'string') {
      return item;
    } else if (item && typeof item === 'object' && item.id) {
      return item.id;
    }
    return null;
  }).filter(Boolean) as string[];

  console.log('[featureMapping] Normalized IDs:', normalizedIds);

  const result = normalizedIds
    .filter(id => {
      const exists = id && FEATURE_DEFINITIONS[id];
      if (!exists) {
        console.warn(`[featureMapping] Feature ID "${id}" not found in FEATURE_DEFINITIONS`);
      }
      return exists;
    })
    .map(id => {
      const definition = FEATURE_DEFINITIONS[id];
      console.log(`[featureMapping] Mapping "${id}" to:`, { name: definition.name, category: definition.category });
      return {
        id: definition.id,
        name: definition.name,
        category: definition.category,
        required: true,
        description: definition.description
      };
    });

  console.log('[featureMapping] Final mapped features:', result);
  return result;
}

/**
 * Get feature definition by ID
 * @param featureId Feature ID string
 * @returns FeatureDefinition or undefined
 */
export function getFeatureDefinition(featureId: string): FeatureDefinition | undefined {
  return FEATURE_DEFINITIONS[featureId];
}

/**
 * Get all available feature IDs
 * @returns Array of all feature IDs
 */
export function getAllFeatureIds(): string[] {
  return Object.keys(FEATURE_DEFINITIONS);
}

/**
 * Get features by category
 * @param category Feature category
 * @returns Array of feature definitions
 */
export function getFeaturesByCategory(category: string): FeatureDefinition[] {
  return Object.values(FEATURE_DEFINITIONS).filter(f => f.category === category);
}

/**
 * Validate feature dependencies
 * @param selectedFeatureIds Selected feature IDs
 * @returns Object with validation results
 */
export function validateFeatureDependencies(selectedFeatureIds: string[]): {
  valid: boolean;
  missingDependencies: string[];
  warnings: string[];
} {
  const missingDependencies: string[] = [];
  const warnings: string[] = [];

  selectedFeatureIds.forEach(id => {
    const feature = FEATURE_DEFINITIONS[id];
    if (feature?.dependencies) {
      feature.dependencies.forEach(depId => {
        if (!selectedFeatureIds.includes(depId)) {
          missingDependencies.push(`${feature.name} requires ${FEATURE_DEFINITIONS[depId]?.name || depId}`);
        }
      });
    }
  });

  return {
    valid: missingDependencies.length === 0,
    missingDependencies,
    warnings
  };
}

/**
 * Get recommended features based on project type
 * @param projectType Project type
 * @returns Array of recommended feature IDs
 */
export function getRecommendedFeatures(projectType: string): string[] {
  const recommendations: Record<string, string[]> = {
    'saas': ['auth', 'database', 'api', 'payment', 'email', 'analytics'],
    'api': ['auth', 'database', 'api', 'testing'],
    'website': ['analytics'],
    'webapp': ['auth', 'database', 'api', 'upload'],
    'mobile': ['auth', 'api', 'analytics'],
    'desktop': ['database', 'upload'],
    'cli': ['testing'],
    'library': ['testing'],
    'microservice': ['api', 'database', 'testing']
  };

  return recommendations[projectType] || [];
}