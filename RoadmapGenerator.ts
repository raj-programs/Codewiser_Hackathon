import { UserContext, SkillGraph, LearningPath, LearningStep, Milestone, SkillGap } from './index';
import { SkillGraphManager } from './SkillGraph';
import { GapAnalysisEngine } from './GapAnalysisEngine';
import { RuleEngine } from './RuleEngine';
import { TopologicalSort } from './TopologicalSort';
import { ExplanationEngine } from './ExplanationEngine';

export class RoadmapGenerator {
  private skillGraphManager: SkillGraphManager;
  private gapAnalysisEngine: GapAnalysisEngine;
  private ruleEngine: RuleEngine;
  private explanationEngine: ExplanationEngine;

  constructor(skillGraphManager?: SkillGraphManager) {
    this.skillGraphManager = skillGraphManager || new SkillGraphManager();
    this.gapAnalysisEngine = new GapAnalysisEngine();
    this.ruleEngine = new RuleEngine();
    this.explanationEngine = new ExplanationEngine();
  }

  generateRoadmap(
    userContext: UserContext,
    targetSkills: string[],
    options: {
      includeRecommended?: boolean;
      maxRecommendedSkills?: number;
      customRules?: any[];
      optimizeForTime?: boolean;
      includeCriticalPath?: boolean;
    } = {}
  ): {
    learningPath: LearningPath;
    skillGaps: SkillGap[];
    explanations: any[];
    summary: string;
    metrics: {
      totalEstimatedHours: number;
      criticalPathHours: number;
      graphDepth: number;
      optimizationSavings?: number;
    };
  } {
    const skillGraph = this.skillGraphManager.getGraph();
    
    const validation = this.skillGraphManager.validateGraph();
    if (!validation.isValid) {
      throw new Error(`Invalid skill graph: ${validation.errors.join(', ')}`);
    }

    // Get graph metrics for enhanced analysis
    const graphMetrics = this.skillGraphManager.getGraphMetrics();
    const criticalPath = this.skillGraphManager.getCriticalPath();
    const levels = this.skillGraphManager.getLevels();

    let skillGaps = this.gapAnalysisEngine.analyzeGaps(userContext, skillGraph, targetSkills);

    if (options.includeRecommended !== false) {
      const recommendedGaps = this.gapAnalysisEngine.analyzeRecommendedSkills(
        userContext,
        skillGraph,
        options.maxRecommendedSkills || 5
      );
      skillGaps = [...skillGaps, ...recommendedGaps];
    }

    if (options.customRules) {
      options.customRules.forEach(rule => this.ruleEngine.addRule(rule));
    }

    skillGaps = this.ruleEngine.applyRules(userContext, skillGraph, skillGaps);

    const learningPath = this.createLearningPath(userContext, skillGaps, targetSkills);

    const explanations = this.explanationEngine.generatePathExplanation(learningPath, userContext);
    const summary = this.explanationEngine.generateOverallSummary(learningPath, userContext, skillGaps);

    // Calculate metrics
    const totalEstimatedHours = learningPath.totalEstimatedHours;
    const metrics = {
      totalEstimatedHours,
      criticalPathHours: criticalPath.totalHours,
      graphDepth: graphMetrics.maxDepth,
      optimizationSavings: options.optimizeForTime ? 
        Math.max(0, criticalPath.totalHours - totalEstimatedHours) : undefined
    };

    return {
      learningPath,
      skillGaps,
      explanations,
      summary,
      metrics
    };
  }

  // Enhanced DAG-specific methods
  generateMultiplePaths(userContext: UserContext, targetSkills: string[]): {
    shortestPath: { path: string[]; hours: number };
    longestPath: { path: string[]; hours: number };
    alternativePaths: Array<{ path: string[]; hours: number; reasoning: string }>;
  } {
    const skillGraph = this.skillGraphManager.getGraph();
    const paths: Array<{ path: string[]; hours: number; reasoning: string }> = [];
    
    // Get critical path (longest)
    const criticalPath = this.skillGraphManager.getCriticalPath();
    
    // Generate alternative paths by considering different skill combinations
    for (const targetSkill of targetSkills) {
      const path = this.skillGraphManager.getLongestPath(targetSkill);
      if (path.path.length > 0) {
        paths.push({
          path: path.path,
          hours: path.totalHours,
          reasoning: `Focus path for ${targetSkill} with all prerequisites`
        });
      }
    }
    
    // Sort by duration
    paths.sort((a, b) => a.hours - b.hours);
    
    return {
      shortestPath: paths[0] || { path: [], hours: 0 },
      longestPath: { path: criticalPath.path, hours: criticalPath.totalHours },
      alternativePaths: paths.slice(1, -1) // Exclude shortest and longest
    };
  }

  optimizeLearningPath(
    userContext: UserContext, 
    skillGaps: SkillGap[],
    optimizationCriteria: 'time' | 'difficulty' | 'prerequisites' = 'time'
  ): SkillGap[] {
    switch (optimizationCriteria) {
      case 'time':
        return skillGaps.sort((a, b) => a.skill.estimatedHours - b.skill.estimatedHours);
      
      case 'difficulty':
        const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };
        return skillGaps.sort((a, b) => 
          difficultyOrder[a.skill.difficulty] - difficultyOrder[b.skill.difficulty]
        );
      
      case 'prerequisites':
        // Sort by dependency chain length (shortest chains first)
        return skillGaps.sort((a, b) => {
          const aPrereqs = this.skillGraphManager.getPrerequisites(a.skillId).length;
          const bPrereqs = this.skillGraphManager.getPrerequisites(b.skillId).length;
          return aPrereqs - bPrereqs;
        });
      
      default:
        return skillGaps;
    }
  }

  analyzeComplexity(): {
    cyclomaticComplexity: number;
    cognitiveLoad: number;
    learningCurve: 'smooth' | 'moderate' | 'steep';
    recommendations: string[];
  } {
    const metrics = this.skillGraphManager.getGraphMetrics();
    const levels = this.skillGraphManager.getLevels();
    
    // Calculate cyclomatic complexity (edges - nodes + 2)
    const cyclomaticComplexity = metrics.totalEdges - metrics.totalNodes + 2;
    
    // Calculate cognitive load based on branching factor and depth
    const cognitiveLoad = metrics.avgBranchingFactor * metrics.maxDepth;
    
    // Determine learning curve
    let learningCurve: 'smooth' | 'moderate' | 'steep' = 'moderate';
    if (cognitiveLoad < 3) learningCurve = 'smooth';
    else if (cognitiveLoad > 8) learningCurve = 'steep';
    
    // Generate recommendations
    const recommendations: string[] = [];
    if (cyclomaticComplexity > 10) {
      recommendations.push('Consider breaking down complex skill dependencies');
    }
    if (metrics.avgBranchingFactor > 3) {
      recommendations.push('High branching factor detected - consider focusing on core paths');
    }
    if (metrics.maxDepth > 6) {
      recommendations.push('Deep learning path - consider intermediate milestones');
    }
    
    return {
      cyclomaticComplexity,
      cognitiveLoad,
      learningCurve,
      recommendations
    };
  }

  private createLearningPath(
    userContext: UserContext,
    skillGaps: SkillGap[],
    targetSkills: string[]
  ): LearningPath {
    const relevantSkills = new Set<string>();
    
    skillGaps.forEach(gap => relevantSkills.add(gap.skillId));
    targetSkills.forEach(skillId => relevantSkills.add(skillId));
    userContext.currentSkills.forEach((skillId : string) => relevantSkills.add(skillId));

    const skillGraph = this.skillGraphManager.getGraph();
    const sortedSkillIds = TopologicalSort.sortSubset(skillGraph, relevantSkills);

    const learningSteps: LearningStep[] = [];
    let totalHours = 0;

    sortedSkillIds.forEach((skillId, index) => {
      const skill = skillGraph.nodes.get(skillId);
      if (!skill) return;

      const status = userContext.currentSkills.has(skillId) 
        ? 'completed' 
        : skillGaps.some(gap => gap.skillId === skillId) 
          ? 'pending' 
          : 'skipped';

      const step: LearningStep = {
        skill,
        order: index + 1,
        status,
        estimatedHours: skill.estimatedHours,
        resources: this.filterResourcesByLearningStyle(skill.resources, userContext.preferredLearningStyle)
      };

      if (status !== 'skipped') {
        totalHours += step.estimatedHours;
      }

      learningSteps.push(step);
    });

    const milestones = this.createMilestones(learningSteps, targetSkills);

    return {
      id: this.generatePathId(userContext, targetSkills),
      title: this.generatePathTitle(userContext, targetSkills),
      description: this.generatePathDescription(userContext, targetSkills),
      skills: learningSteps,
      totalEstimatedHours: totalHours,
      milestones,
      prerequisitesMet: this.checkPrerequisitesMet(userContext, targetSkills)
    };
  }

  private filterResourcesByLearningStyle(resources: any[], learningStyle: string): any[] {
    if (learningStyle === 'mixed') {
      return resources;
    }

    const stylePreferences = {
      'visual': ['video'],
      'reading': ['book', 'documentation'],
      'hands-on': ['tutorial', 'course']
    };

    const preferredTypes = stylePreferences[learningStyle as keyof typeof stylePreferences] || [];
    
    const preferredResources = resources.filter(r => preferredTypes.includes(r.type));
    
    return preferredResources.length > 0 ? preferredResources : resources;
  }

  private createMilestones(learningSteps: LearningStep[], targetSkills: string[]): Milestone[] {
    const milestones: Milestone[] = [];
    const totalSteps = learningSteps.filter(step => step.status !== 'completed').length;
    
    if (totalSteps === 0) return milestones;

    const milestoneCount = Math.min(3, Math.ceil(totalSteps / 3));
    const stepsPerMilestone = Math.ceil(totalSteps / milestoneCount);

    const pendingSteps = learningSteps.filter(step => step.status === 'pending');
    
    for (let i = 0; i < milestoneCount; i++) {
      const startIndex = i * stepsPerMilestone;
      const endIndex = Math.min((i + 1) * stepsPerMilestone, pendingSteps.length);
      const milestoneSteps = pendingSteps.slice(startIndex, endIndex);

      if (milestoneSteps.length === 0) break;

      const milestone: Milestone = {
        id: `milestone-${i + 1}`,
        title: `Milestone ${i + 1}: ${this.getMilestoneTitle(i, milestoneCount)}`,
        description: this.getMilestoneDescription(milestoneSteps, i, milestoneCount),
        requiredSkills: milestoneSteps.map(step => step.skill.id)
      };

      milestones.push(milestone);
    }

    if (targetSkills.length > 0) {
      const finalMilestone: Milestone = {
        id: 'final-goal',
        title: 'Final Goal: Target Skills Achieved',
        description: `Complete all target skills: ${targetSkills.join(', ')}`,
        requiredSkills: targetSkills
      };
      milestones.push(finalMilestone);
    }

    return milestones;
  }

  private getMilestoneTitle(index: number, total: number): string {
    if (index === 0) return 'Foundation Building';
    if (index === total - 1) return 'Advanced Skills';
    if (index === total - 2) return 'Skill Integration';
    return `Skill Development Phase ${index + 1}`;
  }

  private getMilestoneDescription(steps: LearningStep[], index: number, total: number): string {
    const skillNames = steps.map(step => step.skill.name).slice(0, 3).join(', ');
    const additionalCount = Math.max(0, steps.length - 3);
    
    let description = `Focus on ${skillNames}`;
    if (additionalCount > 0) {
      description += ` and ${additionalCount} more skill${additionalCount > 1 ? 's' : ''}`;
    }

    if (index === 0) {
      description += '. Establish core fundamentals and build a strong foundation.';
    } else if (index === total - 1) {
      description += '. Master advanced concepts and practical applications.';
    }

    return description;
  }

  private generatePathId(userContext: UserContext, targetSkills: string[]): string {
    const userId = userContext.experienceLevel + userContext.targetRole || 'unknown';
    const skillsHash = targetSkills.sort().join('-').slice(0, 20);
    return `path-${userId}-${skillsHash}`.replace(/[^a-zA-Z0-9-]/g, '-');
  }

  private generatePathTitle(userContext: UserContext, targetSkills: string[]): string {
    if (userContext.targetRole) {
      return `${userContext.targetRole} Development Path`;
    }
    
    if (targetSkills.length === 1) {
      const skill = this.skillGraphManager.getSkill(targetSkills[0]);
      return skill ? `${skill.name} Learning Path` : 'Custom Learning Path';
    }
    
    return 'Personalized Learning Roadmap';
  }

  private generatePathDescription(userContext: UserContext, targetSkills: string[]): string {
    const parts: string[] = [];
    
    parts.push(`A customized learning path for a ${userContext.experienceLevel} developer`);
    
    if (userContext.targetRole) {
      parts.push(`aiming to become a ${userContext.targetRole}`);
    }
    
    if (userContext.timeCommitment) {
      parts.push(`with ${userContext.timeCommitment} hours per week commitment`);
    }
    
    if (targetSkills.length > 0) {
      const skillNames = targetSkills.slice(0, 3).map(id => {
        const skill = this.skillGraphManager.getSkill(id);
        return skill ? skill.name : id;
      });
      parts.push(`focusing on ${skillNames.join(', ')}`);
    }
    
    return parts.join(' ') + '.';
  }

  private checkPrerequisitesMet(userContext: UserContext, targetSkills: string[]): boolean {
    const skillGraph = this.skillGraphManager.getGraph();
    
    for (const skillId of targetSkills) {
      const skill = skillGraph.nodes.get(skillId);
      if (!skill) continue;
      
      for (const prereqId of skill.prerequisites) {
        if (!userContext.currentSkills.has(prereqId)) {
          return false;
        }
      }
    }
    
    return true;
  }

  getSkillGraphManager(): SkillGraphManager {
    return this.skillGraphManager;
  }

  getRuleEngine(): RuleEngine {
    return this.ruleEngine;
  }

  getExplanationEngine(): ExplanationEngine {
    return this.explanationEngine;
  }
}