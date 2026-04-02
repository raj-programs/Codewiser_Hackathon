import { Skill, SkillGraph, UserContext, SkillGap } from './index';
import { TopologicalSort } from './TopologicalSort';

export class GapAnalysisEngine {
  analyzeGaps(userContext: UserContext, skillGraph: SkillGraph, targetSkills: string[]): SkillGap[] {
    const gaps: SkillGap[] = [];
    const processedSkills = new Set<string>();

    for (const targetSkillId of targetSkills) {
      const targetGaps = this.analyzeSkillGap(userContext, skillGraph, targetSkillId, processedSkills);
      gaps.push(...targetGaps);
    }

    return this.prioritizeGaps(gaps);
  }

  private analyzeSkillGap(
    userContext: UserContext, 
    skillGraph: SkillGraph, 
    skillId: string, 
    processedSkills: Set<string>
  ): SkillGap[] {
    if (processedSkills.has(skillId)) {
      return [];
    }

    processedSkills.add(skillId);
    const gaps: SkillGap[] = [];

    const skill = skillGraph.nodes.get(skillId);
    if (!skill) {
      throw new Error(`Skill ${skillId} not found in skill graph`);
    }

    if (!userContext.currentSkills.has(skillId)) {
      const gap: SkillGap = {
        skillId,
        skill,
        gapType: 'missing',
        priority: this.calculatePriority(skill, userContext),
        reason: this.generateGapReason(skill, userContext, 'missing')
      };
      gaps.push(gap);
    }

    for (const prereqId of skill.prerequisites) {
      if (!userContext.currentSkills.has(prereqId)) {
        const prereqGaps = this.analyzeSkillGap(userContext, skillGraph, prereqId, processedSkills);
        gaps.push(...prereqGaps);

        const prereq = skillGraph.nodes.get(prereqId);
        if (prereq) {
          const prereqGap: SkillGap = {
            skillId: prereqId,
            skill: prereq,
            gapType: 'prerequisite',
            priority: 'high',
            reason: `Required prerequisite for ${skill.name}`
          };
          gaps.push(prereqGap);
        }
      }
    }

    return gaps;
  }

  analyzeRecommendedSkills(userContext: UserContext, skillGraph: SkillGraph, limit: number = 5): SkillGap[] {
    const recommendations: SkillGap[] = [];
    const currentSkillSet = userContext.currentSkills;

    for (const [skillId, skill] of skillGraph.nodes) {
      if (currentSkillSet.has(skillId)) {
        continue;
      }

      if (this.isSkillAccessible(userContext, skillGraph, skillId)) {
        const recommendation: SkillGap = {
          skillId,
          skill,
          gapType: 'recommended',
          priority: this.calculatePriority(skill, userContext),
          reason: this.generateGapReason(skill, userContext, 'recommended')
        };
        recommendations.push(recommendation);
      }
    }

    return recommendations
      .sort((a, b) => this.comparePriority(b.priority, a.priority))
      .slice(0, limit);
  }

  private isSkillAccessible(userContext: UserContext, skillGraph: SkillGraph, skillId: string): boolean {
    const skill = skillGraph.nodes.get(skillId);
    if (!skill) return false;

    for (const prereqId of skill.prerequisites) {
      if (!userContext.currentSkills.has(prereqId)) {
        return false;
      }
    }

    return true;
  }

  private calculatePriority(skill: Skill, userContext: UserContext): 'high' | 'medium' | 'low' {
    let score = 0;

    if (userContext.goals.some(goal => skill.tags.includes(goal))) {
      score += 3;
    }

    if (userContext.targetRole && skill.tags.includes(userContext.targetRole)) {
      score += 2;
    }

    if (userContext.industry && skill.tags.includes(userContext.industry)) {
      score += 1;
    }

    const difficultyScore = this.getDifficultyScore(skill.difficulty, userContext.experienceLevel);
    score += difficultyScore;

    if (score >= 4) return 'high';
    if (score >= 2) return 'medium';
    return 'low';
  }

  private getDifficultyScore(
    skillDifficulty: string, 
    userExperience: string
  ): number {
    const difficultyLevels = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };
    const skillLevel = difficultyLevels[skillDifficulty as keyof typeof difficultyLevels] || 2;
    const userLevel = difficultyLevels[userExperience as keyof typeof difficultyLevels] || 2;

    const diff = Math.abs(skillLevel - userLevel);
    if (diff === 0) return 2;
    if (diff === 1) return 1;
    return 0;
  }

  private generateGapReason(skill: Skill, userContext: UserContext, gapType: string): string {
    const reasons: string[] = [];

    if (gapType === 'missing') {
      reasons.push(`Directly required for your learning path`);
    } else if (gapType === 'recommended') {
      reasons.push(`Recommended based on your profile`);
    }

    if (userContext.goals.some(goal => skill.tags.includes(goal))) {
      reasons.push(`Aligns with your goals: ${userContext.goals.join(', ')}`);
    }

    if (userContext.targetRole && skill.tags.includes(userContext.targetRole)) {
      reasons.push(`Essential for ${userContext.targetRole} role`);
    }

    return reasons.join('. ');
  }

  private prioritizeGaps(gaps: SkillGap[]): SkillGap[] {
    const uniqueGaps = new Map<string, SkillGap>();

    for (const gap of gaps) {
      const existing = uniqueGaps.get(gap.skillId);
      if (!existing || this.comparePriority(gap.priority, existing.priority) > 0) {
        uniqueGaps.set(gap.skillId, gap);
      }
    }

    return Array.from(uniqueGaps.values())
      .sort((a, b) => this.comparePriority(b.priority, a.priority));
  }

  private comparePriority(a: 'high' | 'medium' | 'low', b: 'high' | 'medium' | 'low'): number {
    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    return priorityOrder[a] - priorityOrder[b];
  }

  getSkillStatistics(userContext: UserContext, skillGraph: SkillGraph): {
    totalSkills: number;
    completedSkills: number;
    completionPercentage: number;
    skillsByLevel: Record<string, number>;
    estimatedRemainingHours: number;
  } {
    const totalSkills = skillGraph.nodes.size;
    const completedSkills = userContext.currentSkills.size;
    const completionPercentage = totalSkills > 0 ? (completedSkills / totalSkills) * 100 : 0;

    const skillsByLevel: Record<string, number> = {
      beginner: 0,
      intermediate: 0,
      advanced: 0,
      expert: 0
    };

    let estimatedRemainingHours = 0;

    for (const skill of skillGraph.nodes.values()) {
      skillsByLevel[skill.difficulty]++;
      if (!userContext.currentSkills.has(skill.id)) {
        estimatedRemainingHours += skill.estimatedHours;
      }
    }

    return {
      totalSkills,
      completedSkills,
      completionPercentage,
      skillsByLevel,
      estimatedRemainingHours
    };
  }
}