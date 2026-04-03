import { Rule, UserContext, SkillGraph, SkillGap, Skill } from './index';

export class RuleEngine {
  private rules: Rule[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  addRule(rule: Rule): void {
    this.rules.push(rule);
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  removeRule(ruleId: string): boolean {
    const index = this.rules.findIndex(rule => rule.id === ruleId);
    if (index !== -1) {
      this.rules.splice(index, 1);
      return true;
    }
    return false;
  }

  applyRules(userContext: UserContext, skillGraph: SkillGraph, initialGaps: SkillGap[] = []): SkillGap[] {
    let allGaps = [...initialGaps];

    for (const rule of this.rules) {
      try {
        if (rule.condition(userContext, skillGraph)) {
          const ruleGaps = rule.action(userContext, skillGraph, allGaps);
          allGaps = this.mergeGaps(allGaps, ruleGaps);
        }
      } catch (error) {
        // Rule execution failed - continue with other rules
      }
    }

    return this.deduplicateGaps(allGaps);
  }

  private mergeGaps(existing: SkillGap[], newGaps: SkillGap[]): SkillGap[] {
    const merged = [...existing];
    
    for (const newGap of newGaps) {
      const existingIndex = merged.findIndex(gap => gap.skillId === newGap.skillId);
      
      if (existingIndex !== -1) {
        const existingGap = merged[existingIndex];
        if (this.comparePriority(newGap.priority, existingGap.priority) > 0) {
          merged[existingIndex] = newGap;
        } else if (newGap.gapType === 'prerequisite' && existingGap.gapType !== 'prerequisite') {
          merged[existingIndex] = { ...existingGap, gapType: 'prerequisite' };
        }
      } else {
        merged.push(newGap);
      }
    }

    return merged;
  }

  private deduplicateGaps(gaps: SkillGap[]): SkillGap[] {
    const seen = new Set<string>();
    return gaps.filter(gap => {
      if (seen.has(gap.skillId)) {
        return false;
      }
      seen.add(gap.skillId);
      return true;
    });
  }

  private comparePriority(a: 'high' | 'medium' | 'low', b: 'high' | 'medium' | 'low'): number {
    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    return priorityOrder[a] - priorityOrder[b];
  }

  private initializeDefaultRules(): void {
    this.addRule({
      id: 'beginner-foundation',
      name: 'Beginner Foundation Rule',
      priority: 100,
      condition: (context: UserContext) => context.experienceLevel === 'beginner',
      action: (context: UserContext, skillGraph: SkillGraph, gaps: SkillGap[]) => {
        const newGaps: SkillGap[] = [];
        const beginnerSkills = Array.from(skillGraph.nodes.values())
          .filter(skill => skill.difficulty === 'beginner' && skill.prerequisites.length === 0);

        for (const skill of beginnerSkills) {
          if (!context.currentSkills.has(skill.id) && !gaps.some(gap => gap.skillId === skill.id)) {
            newGaps.push({
              skillId: skill.id,
              skill,
              gapType: 'recommended',
              priority: 'high',
              reason: 'Essential foundation skill for beginners'
            });
          }
        }

        return newGaps;
      }
    });

    this.addRule({
      id: 'role-specific',
      name: 'Role-Specific Skills Rule',
      priority: 90,
      condition: (context: UserContext) => !!context.targetRole,
      action: (context: UserContext, skillGraph: SkillGraph, gaps: SkillGap[]) => {
        const newGaps: SkillGap[] = [];
        const targetRole = context.targetRole!;

        const roleSkills = Array.from(skillGraph.nodes.values())
          .filter(skill => skill.tags.includes(targetRole));

        for (const skill of roleSkills) {
          if (!context.currentSkills.has(skill.id) && !gaps.some(gap => gap.skillId === skill.id)) {
            newGaps.push({
              skillId: skill.id,
              skill,
              gapType: 'recommended',
              priority: 'high',
              reason: `Critical for ${targetRole} role`
            });
          }
        }

        return newGaps;
      }
    });

    this.addRule({
      id: 'prerequisite-chain',
      name: 'Prerequisite Chain Rule',
      priority: 95,
      condition: () => true,
      action: (context: UserContext, skillGraph: SkillGraph, gaps: SkillGap[]) => {
        const newGaps: SkillGap[] = [];
        const processed = new Set<string>();

        for (const gap of gaps) {
          this.addPrerequisiteChain(skillGraph, gap.skillId, context, newGaps, processed);
        }

        return newGaps;
      }
    });

    this.addRule({
      id: 'time-constraint',
      name: 'Time Constraint Rule',
      priority: 50,
      condition: (context: UserContext) => context.timeCommitment < 10,
      action: (context: UserContext, skillGraph: SkillGraph, gaps: SkillGap[]) => {
        return gaps.map(gap => {
          if (gap.skill.estimatedHours > context.timeCommitment * 4) {
            return {
              ...gap,
              priority: 'low' as const,
              reason: `${gap.reason} (High time commitment required)`
            };
          }
          return gap;
        });
      }
    });

    this.addRule({
      id: 'learning-style',
      name: 'Learning Style Rule',
      priority: 60,
      condition: (context: UserContext) => context.preferredLearningStyle !== 'mixed',
      action: (context: UserContext, skillGraph: SkillGraph, gaps: SkillGap[]) => {
        const style = context.preferredLearningStyle;
        const resourceTypeMap = {
          'visual': 'video',
          'reading': 'book',
          'hands-on': 'tutorial'
        };

        const preferredType = resourceTypeMap[style as keyof typeof resourceTypeMap];

        return gaps.map(gap => {
          const filteredResources = gap.skill.resources.filter(
            resource => resource.type === preferredType
          );

          if (filteredResources.length > 0) {
            return {
              ...gap,
              skill: {
                ...gap.skill,
                resources: filteredResources
              }
            };
          }

          return gap;
        });
      }
    });

    this.addRule({
      id: 'industry-specific',
      name: 'Industry-Specific Skills Rule',
      priority: 80,
      condition: (context: UserContext) => !!context.industry,
      action: (context: UserContext, skillGraph: SkillGraph, gaps: SkillGap[]) => {
        const newGaps: SkillGap[] = [];
        const industry = context.industry!;

        const industrySkills = Array.from(skillGraph.nodes.values())
          .filter(skill => skill.tags.includes(industry))
          .filter(skill => !context.currentSkills.has(skill.id))
          .filter(skill => !gaps.some(gap => gap.skillId === skill.id));

        for (const skill of industrySkills.slice(0, 3)) {
          newGaps.push({
            skillId: skill.id,
            skill,
            gapType: 'recommended',
            priority: 'medium',
            reason: `Relevant to ${industry} industry`
          });
        }

        return newGaps;
      }
    });
  }

  private addPrerequisiteChain(
    skillGraph: SkillGraph,
    skillId: string,
    context: UserContext,
    gaps: SkillGap[],
    processed: Set<string>
  ): void {
    if (processed.has(skillId)) return;
    processed.add(skillId);

    const skill = skillGraph.nodes.get(skillId);
    if (!skill) return;

    for (const prereqId of skill.prerequisites) {
      if (!context.currentSkills.has(prereqId) && !gaps.some(gap => gap.skillId === prereqId)) {
        const prereqSkill = skillGraph.nodes.get(prereqId);
        if (prereqSkill) {
          gaps.push({
            skillId: prereqId,
            skill: prereqSkill,
            gapType: 'prerequisite',
            priority: 'high',
            reason: `Required prerequisite for ${skill.name}`
          });
          this.addPrerequisiteChain(skillGraph, prereqId, context, gaps, processed);
        }
      }
    }
  }

  getRules(): Rule[] {
    return [...this.rules];
  }

  clearRules(): void {
    this.rules = [];
  }
}