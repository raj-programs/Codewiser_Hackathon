import express, { Request, Response } from 'express';
import { 
  RoadmapGenerator, 
  SkillGraphManager, 
  UserContext, 
  Skill 
} from './index';

const app = express();
app.use(express.json());

/**
 * Helper to populate the DAG with the skills provided in your example.
 * This ensures the generator has nodes to work with.
 */
function initializeGraph(): SkillGraphManager {
  const skillManager = new SkillGraphManager();
  const sampleSkills: Skill[] = [
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
        { type: 'tutorial', title: 'MDN HTML Tutorial', difficulty: 'beginner', estimatedHours: 8 },
        { type: 'video', title: 'HTML Crash Course', difficulty: 'beginner', estimatedHours: 2 }
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
      resources: [{ type: 'tutorial', title: 'CSS Guide', difficulty: 'beginner', estimatedHours: 12 }]
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
      resources: [{ type: 'course', title: 'JS Complete', difficulty: 'beginner', estimatedHours: 18 }]
    },
    {
      id: 'react-basics',
      name: 'React Basics',
      category: 'web-development',
      difficulty: 'intermediate',
      description: 'Learn React component-based development',
      prerequisites: ['javascript-basics', 'css-basics'],
      estimatedHours: 25,
      tags: ['web-development', 'frontend', 'react'],
      resources: [{ type: 'video', title: 'React Crash Course', difficulty: 'intermediate', estimatedHours: 5 }]
    },
    {
      id: 'nodejs-basics',
      name: 'Node.js Basics',
      category: 'backend',
      difficulty: 'intermediate',
      description: 'Learn server-side JavaScript with Node.js',
      prerequisites: ['javascript-basics'],
      estimatedHours: 30,
      tags: ['backend', 'nodejs'],
      resources: [{ type: 'documentation', title: 'Node Official Docs', difficulty: 'intermediate', estimatedHours: 5 }]
    },
    {
      id: 'fullstack-project',
      name: 'Full-Stack Project',
      category: 'project',
      difficulty: 'advanced',
      description: 'Build a complete full-stack application',
      prerequisites: ['react-basics', 'nodejs-basics'],
      estimatedHours: 40,
      tags: ['fullstack', 'project'],
      resources: [{ type: 'course', title: 'Advanced Full-Stack', difficulty: 'advanced', estimatedHours: 40 }]
    }
  ];

  sampleSkills.forEach(skill => skillManager.addSkill(skill));
  return skillManager;
}

// Global instances
const skillManager = initializeGraph();
const roadmapGenerator = new RoadmapGenerator(skillManager);

/**
 * POST /api/generate
 * Body: { userContext: { currentSkills: string[], ... }, targetSkills: string[] }
 */
app.post('/api/generate', (req: Request, res: Response) => {
  try {
    const { userContext, targetSkills, options } = req.body;

    if (!userContext || !targetSkills) {
      return res.status(400).json({ error: "userContext and targetSkills are required." });
    }

    // Convert currentSkills array to a Set for compatibility with RoadmapGenerator
    const formattedContext: UserContext = {
      ...userContext,
      currentSkills: new Set(userContext.currentSkills || []),
      experienceLevel: userContext.experienceLevel || 'beginner',
      preferredLearningStyle: userContext.preferredLearningStyle || 'mixed'
    };

    // Generate the deterministic roadmap using Topological Sort
    const result = roadmapGenerator.generateRoadmap(
      formattedContext, 
      targetSkills, 
      options || { includeRecommended: true }
    );

    res.json({
      success: true,
      data: {
        title: result.learningPath.title,
        totalHours: result.learningPath.totalEstimatedHours,
        steps: result.learningPath.skills,
        milestones: result.learningPath.milestones,
        gaps: result.skillGaps,
        summary: result.summary
      }
    });

  } catch (error: any) {
    console.error("Roadmap Generation Error:", error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server active at http://localhost:${PORT}`);
  console.log(`Graph initialized with ${skillManager.getGraph().nodes.size} skill nodes.`);
});