import { 
  UserContext, 
  Skill 
} from './index';
import { RoadmapGenerator } from './RoadmapGenerator';
import { SkillGraphManager } from './SkillGraph';

function createSampleSkillGraph(): SkillGraphManager {
  const skillManager = new SkillGraphManager();

  const skills: Skill[] = [
    {
      id: 'html-basics',
      name: 'HTML Basics',
      category: 'web-development',
      difficulty: 'beginner',
      description: 'Learn fundamental HTML tags and structure',
      prerequisites: [],
      estimatedHours: 10,
      tags: ['web-development', 'frontend', 'html'],
      resources: [
        {
          type: 'tutorial',
          title: 'MDN HTML Tutorial',
          difficulty: 'beginner',
          estimatedHours: 8
        },
        {
          type: 'video',
          title: 'HTML Crash Course',
          difficulty: 'beginner',
          estimatedHours: 2
        }
      ]
    },
    {
      id: 'css-basics',
      name: 'CSS Basics',
      category: 'web-development',
      difficulty: 'beginner',
      description: 'Learn CSS styling and layout fundamentals',
      prerequisites: ['html-basics'],
      estimatedHours: 15,
      tags: ['web-development', 'frontend', 'css'],
      resources: [
        {
          type: 'tutorial',
          title: 'CSS Guide',
          difficulty: 'beginner',
          estimatedHours: 12
        },
        {
          type: 'book',
          title: 'CSS: The Definitive Guide',
          difficulty: 'intermediate',
          estimatedHours: 20
        }
      ]
    },
    {
      id: 'javascript-basics',
      name: 'JavaScript Basics',
      category: 'web-development',
      difficulty: 'beginner',
      description: 'Learn JavaScript programming fundamentals',
      prerequisites: ['html-basics'],
      estimatedHours: 20,
      tags: ['web-development', 'frontend', 'javascript'],
      resources: [
        {
          type: 'course',
          title: 'JavaScript Complete Course',
          difficulty: 'beginner',
          estimatedHours: 18
        },
        {
          type: 'book',
          title: 'Eloquent JavaScript',
          difficulty: 'beginner',
          estimatedHours: 25
        }
      ]
    },
    {
      id: 'react-basics',
      name: 'React Basics',
      category: 'web-development',
      difficulty: 'intermediate',
      description: 'Learn React component-based development',
      prerequisites: ['javascript-basics', 'css-basics'],
      estimatedHours: 25,
      tags: ['web-development', 'frontend', 'react', 'javascript'],
      resources: [
        {
          type: 'tutorial',
          title: 'Official React Tutorial',
          difficulty: 'intermediate',
          estimatedHours: 20
        },
        {
          type: 'video',
          title: 'React Crash Course',
          difficulty: 'intermediate',
          estimatedHours: 5
        }
      ]
    },
    {
      id: 'nodejs-basics',
      name: 'Node.js Basics',
      category: 'backend',
      difficulty: 'intermediate',
      description: 'Learn server-side JavaScript with Node.js',
      prerequisites: ['javascript-basics'],
      estimatedHours: 30,
      tags: ['backend', 'nodejs', 'javascript'],
      resources: [
        {
          type: 'course',
          title: 'Node.js Complete Guide',
          difficulty: 'intermediate',
          estimatedHours: 25
        },
        {
          type: 'documentation',
          title: 'Node.js Official Docs',
          difficulty: 'intermediate',
          estimatedHours: 5
        }
      ]
    },
    {
      id: 'fullstack-project',
      name: 'Full-Stack Project',
      category: 'project',
      difficulty: 'advanced',
      description: 'Build a complete full-stack application',
      prerequisites: ['react-basics', 'nodejs-basics'],
      estimatedHours: 40,
      tags: ['fullstack', 'project', 'react', 'nodejs'],
      resources: [
        {
          type: 'tutorial',
          title: 'Full-Stack Project Tutorial',
          difficulty: 'advanced',
          estimatedHours: 35
        },
        {
          type: 'course',
          title: 'Advanced Full-Stack Development',
          difficulty: 'advanced',
          estimatedHours: 40
        }
      ]
    }
  ];

  skills.forEach(skill => skillManager.addSkill(skill));

  return skillManager;
}

function createUserContext(): UserContext {
  return {
    currentSkills: new Set(['html-basics']),
    experienceLevel: 'beginner',
    goals: ['fullstack', 'react'],
    preferredLearningStyle: 'mixed',
    timeCommitment: 10,
    targetRole: 'full-stack-developer',
    industry: 'technology'
  };
}

function main() {
  console.log('🚀 Smart Developer Roadmap Generator - Example Usage\n');

  const skillManager = createSampleSkillGraph();
  const roadmapGenerator = new RoadmapGenerator(skillManager);
  const userContext = createUserContext();

  console.log('📊 User Profile:');
  console.log(`- Experience Level: ${userContext.experienceLevel}`);
  console.log(`- Target Role: ${userContext.targetRole}`);
  console.log(`- Time Commitment: ${userContext.timeCommitment} hours/week`);
  console.log(`- Current Skills: ${Array.from(userContext.currentSkills).join(', ')}`);
  console.log(`- Goals: ${userContext.goals.join(', ')}\n`);

  const targetSkills = ['fullstack-project'];

  try {
    const result = roadmapGenerator.generateRoadmap(userContext, targetSkills, {
      includeRecommended: true,
      maxRecommendedSkills: 3
    });

    console.log('🎯 Generated Learning Path:');
    console.log(`Title: ${result.learningPath.title}`);
    console.log(`Total Skills: ${result.learningPath.skills.length}`);
    console.log(`Total Estimated Hours: ${result.learningPath.totalEstimatedHours}`);
    console.log(`Milestones: ${result.learningPath.milestones.length}`);
    console.log(`Skill Gaps Identified: ${result.skillGaps.length}\n`);

    console.log('📚 Learning Steps:');
    result.learningPath.skills
      .filter(step => step.status === 'pending')
      .slice(0, 5)
      .forEach(step => {
        console.log(`${step.order}. ${step.skill.name} (${step.skill.difficulty}) - ${step.estimatedHours}h`);
        console.log(`   ${step.skill.description}`);
        console.log(`   Resources: ${step.resources.length} available\n`);
      });

    console.log('🎯 Milestones:');
    result.learningPath.milestones.forEach((milestone, index) => {
      console.log(`${index + 1}. ${milestone.title}`);
      console.log(`   ${milestone.description}`);
      console.log(`   Required Skills: ${milestone.requiredSkills.length}\n`);
    });

    console.log('⚠️ Skill Gaps:');
    result.skillGaps.slice(0, 3).forEach(gap => {
      console.log(`- ${gap.skill.name} (${gap.priority} priority, ${gap.gapType})`);
      console.log(`  ${gap.reason}\n`);
    });

    console.log('📋 Summary:');
    console.log(result.summary);

  } catch (error) {
    console.error('Error generating roadmap:', error);
  }
}

// Run the example if this file is executed directly
main();
