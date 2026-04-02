export interface Skill {
  id: string;
  name: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  description: string;
  prerequisites: string[];
  estimatedHours: number;
  tags: string[];
  resources: Resource[];
}

export interface Resource {
  type: 'book' | 'course' | 'tutorial' | 'documentation' | 'video';
  title: string;
  url?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedHours: number;
}

export interface SkillGraph {
  nodes: Map<string, Skill>;
  edges: Map<string, Set<string>>;
  adjacencyList: Map<string, Set<string>>;
  reverseAdjacencyList: Map<string, Set<string>>;
}

export interface UserContext {
  currentSkills: Set<string>;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  goals: string[];
  preferredLearningStyle: 'visual' | 'reading' | 'hands-on' | 'mixed';
  timeCommitment: number; // hours per week
  targetRole?: string;
  industry?: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  skills: LearningStep[];
  totalEstimatedHours: number;
  milestones: Milestone[];
  prerequisitesMet: boolean;
}

export interface LearningStep {
  skill: Skill;
  order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  estimatedHours: number;
  resources: Resource[];
  notes?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  achievedAt?: Date;
}

export interface SkillGap {
  skillId: string;
  skill: Skill;
  gapType: 'missing' | 'prerequisite' | 'recommended';
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

export interface Rule {
  id: string;
  name: string;
  condition: (context: UserContext, skillGraph: SkillGraph) => boolean;
  action: (context: UserContext, skillGraph: SkillGraph, gaps: SkillGap[]) => SkillGap[];
  priority: number;
}

export interface Explanation {
  stepId: string;
  explanation: string;
  reasoning: string[];
  alternatives: string[];
  tips: string[];
}
