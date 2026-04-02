# Smart Developer Roadmap Generator

A deterministic, rule-based learning roadmap generator built with TypeScript. Uses Directed Acyclic Graphs (DAG) for skill dependencies and topological sorting for optimal learning paths.

## Features

- **Deterministic**: No AI/ML/LLM usage - completely rule-based
- **DAG-based**: Uses Directed Acyclic Graphs for skill dependencies
- **Topological Sorting**: Ensures optimal learning order based on prerequisites
- **Rule Engine**: Customizable rules for personalized recommendations
- **Gap Analysis**: Identifies skill gaps and learning priorities
- **Explanation Engine**: Provides detailed explanations for learning choices

## Architecture

### Core Modules

1. **Skill Graph** (`src/skill-graph/`)
   - Manages skill relationships and dependencies
   - Validates DAG structure
   - Provides graph traversal methods

2. **Gap Analysis Engine** (`src/gap-analysis/`)
   - Identifies skill gaps based on user context
   - Prioritizes learning recommendations
   - Analyzes prerequisites and missing skills

3. **Rule Engine** (`src/rules/`)
   - Applies deterministic rules for customization
   - Handles role-specific, industry-specific, and learning style rules
   - Supports custom rule definitions

4. **Topological Sort** (`src/algorithms/`)
   - Implements Kahn's algorithm for dependency resolution
   - Handles subgraph extraction and level assignment
   - Validates partial ordering

5. **Explanation Engine** (`src/explanation/`)
   - Generates detailed explanations for learning paths
   - Provides learning tips and alternatives
   - Creates milestone explanations

## Installation

```bash
npm install
```

## Usage

### Basic Example

```typescript
import { RoadmapGenerator, SkillGraphManager, UserContext } from './src';

// Create skill graph
const skillManager = new SkillGraphManager();
// Add skills with prerequisites...

// Define user context
const userContext: UserContext = {
  currentSkills: new Set(['html-basics']),
  experienceLevel: 'beginner',
  goals: ['fullstack'],
  preferredLearningStyle: 'mixed',
  timeCommitment: 10,
  targetRole: 'full-stack-developer'
};

// Generate roadmap
const generator = new RoadmapGenerator(skillManager);
const result = generator.generateRoadmap(userContext, ['react-basics']);

console.log(result.learningPath);
console.log(result.skillGaps);
console.log(result.explanations);
```

### Running the Example

```bash
npm run dev
```

## Core Interfaces

### Skill
```typescript
interface Skill {
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
```

### UserContext
```typescript
interface UserContext {
  currentSkills: Set<string>;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  goals: string[];
  preferredLearningStyle: 'visual' | 'reading' | 'hands-on' | 'mixed';
  timeCommitment: number;
  targetRole?: string;
  industry?: string;
}
```

### LearningPath
```typescript
interface LearningPath {
  id: string;
  title: string;
  description: string;
  skills: LearningStep[];
  totalEstimatedHours: number;
  milestones: Milestone[];
  prerequisitesMet: boolean;
}
```

## Rule System

The system includes built-in rules for:

- **Beginner Foundation**: Recommends foundational skills for beginners
- **Role-Specific**: Prioritizes skills relevant to target roles
- **Prerequisite Chain**: Ensures all prerequisites are included
- **Time Constraint**: Adjusts recommendations based on available time
- **Learning Style**: Filters resources based on learning preferences
- **Industry-Specific**: Adds relevant industry skills

### Custom Rules

```typescript
const customRule = {
  id: 'custom-rule',
  name: 'Custom Learning Rule',
  priority: 75,
  condition: (context: UserContext, skillGraph: SkillGraph) => {
    return context.goals.includes('mobile-development');
  },
  action: (context: UserContext, skillGraph: SkillGraph, gaps: SkillGap[]) => {
    // Custom logic to add skill gaps
    return newGaps;
  }
};

generator.getRuleEngine().addRule(customRule);
```

## Deterministic Behavior

The system is completely deterministic:

- Same input (user context + target skills) always produces the same output
- No randomization or AI/ML involved
- Rule-based logic ensures reproducible results
- Topological sort provides consistent ordering

## Development

```bash
# Build the project
npm run build

# Run in development mode
npm run dev

# Run tests
npm test
```

## Project Structure

```
src/
├── types/                 # TypeScript interfaces
├── skill-graph/          # DAG-based skill management
├── gap-analysis/         # Skill gap identification
├── rules/                # Rule engine implementation
├── algorithms/           # Topological sort algorithms
├── explanation/          # Explanation generation
├── RoadmapGenerator.ts   # Main orchestrator
└── index.ts              # Public exports

examples/
└── basic-usage.ts        # Usage example
```

## License

MIT
