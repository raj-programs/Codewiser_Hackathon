import { SkillGraphManager } from './SkillGraph';
import { RoadmapGenerator } from './RoadmapGenerator';
import { UserContext } from './index';

// Example: Enhanced DAG-based Roadmap Generation
function demonstrateDAGFeatures() {
  const skillGraphManager = new SkillGraphManager();
  
  // Create a more complex skill DAG
  const skills = [
    {
      id: 'html',
      name: 'HTML Fundamentals',
      category: 'Web Development',
      difficulty: 'beginner' as const,
      description: 'Basic HTML structure and semantics',
      prerequisites: [],
      estimatedHours: 10,
      tags: ['web', 'frontend', 'basic'],
      resources: []
    },
    {
      id: 'css',
      name: 'CSS Styling',
      category: 'Web Development',
      difficulty: 'beginner' as const,
      description: 'CSS styling and layout',
      prerequisites: ['html'],
      estimatedHours: 15,
      tags: ['web', 'frontend', 'styling'],
      resources: []
    },
    {
      id: 'javascript',
      name: 'JavaScript Programming',
      category: 'Web Development',
      difficulty: 'intermediate' as const,
      description: 'JavaScript fundamentals and DOM manipulation',
      prerequisites: ['html', 'css'],
      estimatedHours: 30,
      tags: ['web', 'frontend', 'programming'],
      resources: []
    },
    {
      id: 'react',
      name: 'React Framework',
      category: 'Web Development',
      difficulty: 'intermediate' as const,
      description: 'React components and state management',
      prerequisites: ['javascript'],
      estimatedHours: 25,
      tags: ['web', 'frontend', 'framework', 'react'],
      resources: []
    },
    {
      id: 'typescript',
      name: 'TypeScript',
      category: 'Web Development',
      difficulty: 'intermediate' as const,
      description: 'TypeScript for type-safe JavaScript',
      prerequisites: ['javascript'],
      estimatedHours: 20,
      tags: ['web', 'frontend', 'types'],
      resources: []
    },
    {
      id: 'nodejs',
      name: 'Node.js Backend',
      category: 'Web Development',
      difficulty: 'intermediate' as const,
      description: 'Server-side JavaScript with Node.js',
      prerequisites: ['javascript'],
      estimatedHours: 35,
      tags: ['web', 'backend', 'server'],
      resources: []
    },
    {
      id: 'fullstack',
      name: 'Full Stack Development',
      category: 'Web Development',
      difficulty: 'advanced' as const,
      description: 'Complete full stack application development',
      prerequisites: ['react', 'nodejs'],
      estimatedHours: 40,
      tags: ['web', 'fullstack', 'advanced'],
      resources: []
    }
  ];

  // Add skills to build the DAG
  skills.forEach(skill => skillGraphManager.addSkill(skill));

  console.log('=== DAG Analysis ===');
  
  // 1. Graph Metrics
  const metrics = skillGraphManager.getGraphMetrics();
  console.log('Graph Metrics:', metrics);
  
  // 2. Critical Path Analysis
  const criticalPath = skillGraphManager.getCriticalPath();
  console.log('Critical Path:', criticalPath);
  
  // 3. Level-based Organization
  const levels = skillGraphManager.getLevels();
  console.log('Skill Levels:', levels);
  
  // 4. Graph Validation
  const validation = skillGraphManager.validateGraph();
  console.log('Graph Validation:', validation);

  console.log('\n=== Enhanced Roadmap Generation ===');
  
  const roadmapGenerator = new RoadmapGenerator(skillGraphManager);
  
  // User context
  const userContext: UserContext = {
    currentSkills: new Set(['html']),
    experienceLevel: 'beginner',
    goals: ['frontend', 'react'],
    preferredLearningStyle: 'hands-on',
    timeCommitment: 10,
    targetRole: 'Frontend Developer'
  };

  // Generate enhanced roadmap
  const roadmap = roadmapGenerator.generateRoadmap(
    userContext,
    ['react', 'typescript'],
    {
      includeRecommended: true,
      optimizeForTime: true,
      includeCriticalPath: true
    }
  );

  console.log('Roadmap Metrics:', roadmap.metrics);
  console.log('Learning Path Steps:', roadmap.learningPath.skills.length);
  console.log('Skill Gaps Identified:', roadmap.skillGaps.length);

  // 5. Multiple Path Analysis
  const multiplePaths = roadmapGenerator.generateMultiplePaths(userContext, ['react']);
  console.log('Multiple Learning Paths:', multiplePaths);

  // 6. Complexity Analysis
  const complexity = roadmapGenerator.analyzeComplexity();
  console.log('Learning Complexity Analysis:', complexity);

  // 7. Optimized Learning Path
  const optimizedGaps = roadmapGenerator.optimizeLearningPath(
    userContext,
    roadmap.skillGaps,
    'time'
  );
  console.log('Optimized Skill Gaps (by time):', 
    optimizedGaps.map(gap => ({ skill: gap.skill.name, hours: gap.skill.estimatedHours }))
  );

  return {
    metrics,
    criticalPath,
    levels,
    roadmap,
    multiplePaths,
    complexity
  };
}

// Run the demonstration
if (require.main === module) {
  const results = demonstrateDAGFeatures();
  console.log('\n=== DAG Model Demonstration Complete ===');
}

export { demonstrateDAGFeatures };
