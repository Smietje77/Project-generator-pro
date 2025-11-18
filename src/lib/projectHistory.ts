/**
 * Project History Management
 * Tracks generated projects in localStorage for quick access
 */

export interface ProjectHistoryItem {
  id: string;
  projectName: string;
  description: string;
  projectType: string;
  templateId?: string;
  templateName?: string;
  projectPath?: string;
  sanitizedName?: string;
  createdAt: string;
  features?: string[];
  techStack?: {
    frontend?: string;
    backend?: string;
    database?: string;
  };
}

const STORAGE_KEY = 'project-generator-history';
const MAX_HISTORY_ITEMS = 20;

/**
 * Get all project history items
 */
export function getProjectHistory(): ProjectHistoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const items = JSON.parse(stored) as ProjectHistoryItem[];
    // Sort by creation date (newest first)
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('[ProjectHistory] Error loading history:', error);
    return [];
  }
}

/**
 * Add a project to history
 */
export function addToHistory(project: Omit<ProjectHistoryItem, 'id' | 'createdAt'>): void {
  try {
    const history = getProjectHistory();

    // Create new history item
    const newItem: ProjectHistoryItem = {
      ...project,
      id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };

    // Check for duplicates (same project name within last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const isDuplicate = history.some(item =>
      item.projectName === project.projectName &&
      new Date(item.createdAt) > oneHourAgo
    );

    if (isDuplicate) {
      console.log('[ProjectHistory] Skipping duplicate project within last hour');
      return;
    }

    // Add to beginning of array
    history.unshift(newItem);

    // Keep only last MAX_HISTORY_ITEMS
    const trimmed = history.slice(0, MAX_HISTORY_ITEMS);

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));

    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('project-history:updated'));
  } catch (error) {
    console.error('[ProjectHistory] Error adding to history:', error);
  }
}

/**
 * Remove a project from history
 */
export function removeFromHistory(id: string): void {
  try {
    const history = getProjectHistory();
    const filtered = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('project-history:updated'));
  } catch (error) {
    console.error('[ProjectHistory] Error removing from history:', error);
  }
}

/**
 * Clear all history
 */
export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('project-history:updated'));
  } catch (error) {
    console.error('[ProjectHistory] Error clearing history:', error);
  }
}

/**
 * Get a specific project from history
 */
export function getProjectFromHistory(id: string): ProjectHistoryItem | null {
  try {
    const history = getProjectHistory();
    return history.find(item => item.id === id) || null;
  } catch (error) {
    console.error('[ProjectHistory] Error getting project:', error);
    return null;
  }
}

/**
 * Load project data into wizard
 */
export function loadProjectIntoWizard(project: ProjectHistoryItem): void {
  try {
    // Store basic info in Step1 format
    sessionStorage.setItem('step1Data', JSON.stringify({
      projectName: project.projectName,
      description: project.description,
      projectType: project.projectType,
      templateId: project.templateId
    }));

    // Store features/tech stack if available
    if (project.features || project.techStack) {
      sessionStorage.setItem('step2Data', JSON.stringify({
        features: project.features || [],
        techStack: project.techStack || {},
        additionalRequirements: '',
        estimatedComplexity: 'moderate'
      }));
    }

    // If it was a template, set template flags
    if (project.templateId) {
      sessionStorage.setItem('templateId', project.templateId);
    }

    console.log('[ProjectHistory] Loaded project into wizard:', project.projectName);
  } catch (error) {
    console.error('[ProjectHistory] Error loading project:', error);
  }
}

/**
 * Get history statistics
 */
export function getHistoryStats(): {
  total: number;
  templates: number;
  custom: number;
  lastWeek: number;
} {
  const history = getProjectHistory();
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return {
    total: history.length,
    templates: history.filter(item => item.templateId).length,
    custom: history.filter(item => !item.templateId).length,
    lastWeek: history.filter(item => new Date(item.createdAt) > oneWeekAgo).length
  };
}
