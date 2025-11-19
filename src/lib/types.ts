// ============================================================================
// MCP Server Types
// ============================================================================

export interface MCPServer {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  useCases: string[];
  categories: MCPCategory[];
  required?: boolean;
}

export type MCPCategory = 
  | 'filesystem'
  | 'version-control'
  | 'database'
  | 'api'
  | 'automation'
  | 'browser'
  | 'documentation'
  | 'deployment'
  | 'communication'
  | 'ai';

// ============================================================================
// Agent Types
// ============================================================================

export interface Agent {
  id: string;
  name: string;
  role: string;
  responsibilities: string[];
  mcpAccess: string[];
  collaboratesWith: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export type AgentType =
  | 'managing'
  | 'backend'
  | 'frontend'
  | 'qa'
  | 'documentation'
  | 'devops'
  | 'research'
  | 'security'
  | 'data';

// ============================================================================
// Project Types
// ============================================================================

export interface ProjectConfig {
  name: string;
  description: string;
  type: ProjectType;
  features: ProjectFeature[];
  techStack: TechStack;
  metadata: ProjectMetadata;
}

export type ProjectType =
  | 'saas'
  | 'website'
  | 'api'
  | 'mobile-app'
  | 'cli-tool'
  | 'desktop-app'
  | 'chrome-extension'
  | 'automation-script';

export interface ProjectFeature {
  id: string;
  name: string;
  category: FeatureCategory;
  required: boolean;
}

export type FeatureCategory =
  | 'authentication'
  | 'database'
  | 'storage'
  | 'realtime'
  | 'payments'
  | 'email'
  | 'analytics'
  | 'monitoring'
  | 'search'
  | 'ai'
  | 'automation';

export interface TechStack {
  frontend?: string[];
  backend?: string[];
  database?: string[];
  infrastructure?: string[];
  tools?: string[];
}

export interface ProjectMetadata {
  createdAt: Date;
  estimatedComplexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
  estimatedDuration: string;
  teamSize: number;
}

// ============================================================================
// Analysis Types
// ============================================================================

export interface AnalysisResult {
  project: ProjectConfig;
  recommendedMCPs: MCPServer[];
  requiredAgents: Agent[];
  taskBreakdown: Task[];
  collaborationProtocol: CollaborationProtocol;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedAgent: string;
  dependencies: string[];
  estimatedHours: number;
  priority: number;
}

export interface CollaborationProtocol {
  communicationChannels: string[];
  reviewProcess: string[];
  conflictResolution: string[];
  progressTracking: string[];
}

// ============================================================================
// Prompt Generation Types
// ============================================================================

export interface GeneratedPrompt {
  markdown: string;
  starterPrompt: string;
  metadata: PromptMetadata;
}

export interface PromptMetadata {
  projectName: string;
  totalAgents: number;
  totalMCPs: number;
  totalTasks: number;
  generatedAt: Date;
}

// ============================================================================
// Wizard Step Types
// ============================================================================

export interface WizardState {
  currentStep: number;
  step1Data: Step1Data | null;
  step2Data: Step2Data | null;
  step3Data: Step3Data | null;
  analysisResult: AnalysisResult | null;
}

export interface Step1Data {
  projectName: string;
  description: string;
  projectType: ProjectType;
}

export interface Step2Data {
  features: string[];
  techPreferences: {
    frontend?: string;
    backend?: string;
    database?: string;
  };
  additionalRequirements: string;
}

export interface Step3Data {
  confirmedMCPs: string[];
  confirmedAgents: string[];
  customizations: Record<string, any>;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GenerateProjectResponse {
  promptPath: string;
  projectPath: string;
  githubUrl?: string;
  downloadUrl: string;
}
