import { Skill, UserContext, LearningPath, LearningStep, Explanation, SkillGap } from '../types';
import { TopologicalSort } from '../algorithms/TopologicalSort';

export class ExplanationEngine {
  generatePathExplanation(
    learningPath: LearningPath,
    userContext: UserContext
  ): Explanation[] {
    const explanations: Explanation[] = [];

    for (const step of learningPath.skills) {
      const explanation = this.generateStepExplanation(step, userContext, learningPath);
      explanations.push(explanation);
    }

    return explanations;
  }

  private generateStepExplanation(
    step: LearningStep,
    userContext: UserContext,
    learningPath: LearningPath
  ): Explanation {
    const skill = step.skill;
    const reasoning: string[] = [];
    const tips: string[] = [];
    const alternatives: string[] = [];

    reasoning.push(`This ${skill.difficulty} level skill is essential for your learning path`);
    reasoning.push(`Estimated completion time: ${skill.estimatedHours} hours`);

    if (skill.prerequisites.length > 0) {
      reasoning.push(`Builds upon: ${skill.prerequisites.length} prerequisite(s)`);
    }

    if (userContext.goals.some(goal => skill.tags.includes(goal))) {
      reasoning.push(`Directly supports your goal: ${userContext.goals.find(g => skill.tags.includes(g))}`);
    }

    if (userContext.targetRole && skill.tags.includes(userContext.targetRole)) {
      reasoning.push(`Critical for ${userContext.targetRole} role development`);
    }

    tips.push(...this.generateLearningTips(skill, userContext));
    alternatives.push(...this.generateAlternatives(skill, userContext));

    const explanation = this.formatExplanation(skill, step.order, reasoning, tips, alternatives);

    return {
      stepId: step.skill.id,
      explanation,
      reasoning,
      alternatives,
      tips
    };
  }

  private generateLearningTips(skill: Skill, userContext: UserContext): string[] {
    const tips: string[] = [];

    if (skill.difficulty === 'beginner') {
      tips.push('Start with official documentation and basic tutorials');
      tips.push('Practice with small, hands-on projects');
    } else if (skill.difficulty === 'intermediate') {
      tips.push('Focus on practical applications and real-world scenarios');
      tips.push('Consider building a portfolio project to demonstrate mastery');
    } else if (skill.difficulty === 'advanced') {
      tips.push('Deep dive into advanced concepts and best practices');
      tips.push('Contribute to open source projects or mentor others');
    } else if (skill.difficulty === 'expert') {
      tips.push('Focus on architecture, optimization, and innovation');
      tips.push('Share knowledge through writing, speaking, or teaching');
    }

    if (userContext.timeCommitment < 5) {
      tips.push('Break down learning into smaller, manageable sessions');
      tips.push('Focus on consistency rather than intensity');
    } else if (userContext.timeCommitment > 15) {
      tips.push('You can dedicate substantial time - consider intensive learning approaches');
      tips.push('Balance theory with practical implementation');
    }

    if (userContext.preferredLearningStyle === 'visual') {
      tips.push('Utilize video tutorials and visual diagrams');
      tips.push('Create mind maps and visual notes');
    } else if (userContext.preferredLearningStyle === 'reading') {
      tips.push('Focus on books, documentation, and written tutorials');
      tips.push('Take detailed notes and create summaries');
    } else if (userContext.preferredLearningStyle === 'hands-on') {
      tips.push('Prioritize coding exercises and practical projects');
      tips.push('Learn by doing and experimenting with code');
    }

    return tips;
  }

  private generateAlternatives(skill: Skill, userContext: UserContext): string[] {
    const alternatives: string[] = [];

    if (skill.resources.length > 1) {
      const resourceTypes = [...new Set(skill.resources.map(r => r.type))];
      if (resourceTypes.length > 1) {
        alternatives.push(`Choose from ${resourceTypes.join(', ')} learning formats`);
      }
    }

    if (skill.tags.includes('web-development')) {
      alternatives.push('Consider learning frameworks like React, Vue, or Angular');
    }
    if (skill.tags.includes('backend')) {
      alternatives.push('Explore Node.js, Python, or Java for backend development');
    }
    if (skill.tags.includes('database')) {
      alternatives.push('Consider both SQL and NoSQL database options');
    }

    if (userContext.timeCommitment < 10) {
      alternatives.push('Extended learning path available with more time commitment');
    }

    return alternatives;
  }

  private formatExplanation(
    skill: Skill,
    order: number,
    reasoning: string[],
    tips: string[],
    alternatives: string[]
  ): string {
    let explanation = `Step ${order}: ${skill.name}\n\n`;
    explanation += `${skill.description}\n\n`;
    explanation += `**Why this skill matters:**\n`;
    explanation += reasoning.map(r => `• ${r}`).join('\n');
    
    if (tips.length > 0) {
      explanation += `\n\n**Learning Tips:**\n`;
      explanation += tips.map(t => `• ${t}`).join('\n');
    }

    if (alternatives.length > 0) {
      explanation += `\n\n**Alternatives & Options:**\n`;
      explanation += alternatives.map(a => `• ${a}`).join('\n');
    }

    explanation += `\n\n**Recommended Resources:**\n`;
    for (const resource of skill.resources.slice(0, 3)) {
      explanation += `• ${resource.title} (${resource.type}, ${resource.estimatedHours}h)\n`;
    }

    return explanation;
  }

  generateGapExplanation(gap: SkillGap, userContext: UserContext): Explanation {
    const reasoning: string[] = [];
    const tips: string[] = [];
    const alternatives: string[] = [];

    reasoning.push(gap.reason);

    if (gap.gapType === 'prerequisite') {
      reasoning.push('This skill is required before you can proceed to more advanced topics');
      tips.push('Complete this skill early in your learning journey');
      tips.push('Focus on understanding core concepts thoroughly');
    } else if (gap.gapType === 'missing') {
      reasoning.push('This skill is directly required for your learning goals');
      tips.push('Prioritize this skill in your study schedule');
    } else if (gap.gapType === 'recommended') {
      reasoning.push('This skill would enhance your capabilities and career prospects');
      tips.push('Consider this skill after completing core requirements');
    }

    if (gap.priority === 'high') {
      tips.push('High priority - address this skill soon');
    } else if (gap.priority === 'medium') {
      tips.push('Medium priority - plan for this in the near future');
    } else {
      tips.push('Lower priority - can be addressed later');
    }

    const explanation = `Skill Gap: ${gap.skill.name}\n\n` +
      `${gap.skill.description}\n\n` +
      `**Priority:** ${gap.priority.toUpperCase()}\n` +
      `**Type:** ${gap.gapType}\n\n` +
      `**Why this matters:**\n• ${gap.reason}\n\n` +
      `**Recommendations:**\n${tips.map(t => `• ${t}`).join('\n')}`;

    return {
      stepId: gap.skillId,
      explanation,
      reasoning,
      alternatives,
      tips
    };
  }

  generateMilestoneExplanation(milestone: any, completedSkills: Set<string>): string {
    const requiredSkills: string[] = milestone.requiredSkills;
    const completedRequired = requiredSkills.filter((skillId: string) => completedSkills.has(skillId));
    const progress = (completedRequired.length / requiredSkills.length) * 100;

    let explanation = `Milestone: ${milestone.title}\n\n`;
    explanation += `${milestone.description}\n\n`;
    explanation += `**Progress:** ${Math.round(progress)}% (${completedRequired.length}/${requiredSkills.length} skills completed)\n\n`;

    if (progress === 100) {
      explanation += '🎉 **Milestone Achieved!** You have completed all required skills for this milestone.';
    } else if (progress >= 50) {
      explanation += '📈 **Halfway there!** Continue with the remaining skills to complete this milestone.';
    } else {
      explanation += '🚀 **Just getting started!** Focus on the required skills to reach this milestone.';
    }

    const missingSkills = requiredSkills.filter((skillId: string) => !completedSkills.has(skillId));
    if (missingSkills.length > 0) {
      explanation += `\n\n**Remaining skills:** ${missingSkills.length} skill(s) to complete`;
    }

    return explanation;
  }

  generateOverallSummary(
    learningPath: LearningPath,
    userContext: UserContext,
    gaps: SkillGap[]
  ): string {
    const totalHours = learningPath.totalEstimatedHours;
    const weeksNeeded = Math.ceil(totalHours / userContext.timeCommitment);
    const highPriorityGaps = gaps.filter(gap => gap.priority === 'high').length;

    let summary = '# Your Personalized Learning Roadmap\n\n';
    summary += `**Path:** ${learningPath.title}\n`;
    summary += `**Total Skills:** ${learningPath.skills.length}\n`;
    summary += `**Estimated Time:** ${totalHours} hours (~${weeksNeeded} weeks)\n`;
    summary += `**Milestones:** ${learningPath.milestones.length}\n\n`;

    if (highPriorityGaps > 0) {
      summary += `**⚠️ High Priority Gaps:** ${highPriorityGaps} skills need immediate attention\n\n`;
    }

    summary += '## Learning Approach\n\n';
    summary += `Based on your ${userContext.experienceLevel} experience level and ${userContext.preferredLearningStyle} learning style, `;
    summary += `this path is optimized for your ${userContext.timeCommitment} hours/week commitment.\n\n`;

    if (userContext.targetRole) {
      summary += `This roadmap is specifically designed to prepare you for a **${userContext.targetRole}** role.\n\n`;
    }

    summary += '## Next Steps\n\n';
    const nextSteps = learningPath.skills
      .filter(step => step.status === 'pending')
      .slice(0, 3);
    
    if (nextSteps.length > 0) {
      summary += 'Start with these skills:\n';
      nextSteps.forEach((step, index) => {
        summary += `${index + 1}. **${step.skill.name}** (${step.skill.estimatedHours}h)\n`;
      });
    }

    return summary;
  }
}
