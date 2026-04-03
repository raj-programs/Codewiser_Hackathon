import { Skill, SkillGraph } from './index';

export class SkillGraphManager {
  private graph: SkillGraph;

  constructor() {
    this.graph = {
      nodes: new Map(),
      edges: new Map(),
      adjacencyList: new Map(),
      reverseAdjacencyList: new Map()
    };
  }

  addSkill(skill: Skill): void {
    if (this.graph.nodes.has(skill.id)) {
      throw new Error(`Skill with id ${skill.id} already exists`);
    }

    this.graph.nodes.set(skill.id, skill);
    this.graph.adjacencyList.set(skill.id, new Set());
    this.graph.reverseAdjacencyList.set(skill.id, new Set());

    for (const prereqId of skill.prerequisites) {
      if (!this.graph.nodes.has(prereqId)) {
        throw new Error(`Prerequisite skill ${prereqId} not found for skill ${skill.id}`);
      }
      
      this.addEdge(prereqId, skill.id);
    }
  }

  private addEdge(from: string, to: string): void {
    if (!this.graph.edges.has(from)) {
      this.graph.edges.set(from, new Set());
    }
    this.graph.edges.get(from)!.add(to);

    if (!this.graph.adjacencyList.has(from)) {
      this.graph.adjacencyList.set(from, new Set());
    }
    this.graph.adjacencyList.get(from)!.add(to);

    if (!this.graph.reverseAdjacencyList.has(to)) {
      this.graph.reverseAdjacencyList.set(to, new Set());
    }
    this.graph.reverseAdjacencyList.get(to)!.add(from);
  }

  getSkill(id: string): Skill | undefined {
    return this.graph.nodes.get(id);
  }

  getAllSkills(): Skill[] {
    return Array.from(this.graph.nodes.values());
  }

  getPrerequisites(skillId: string): Skill[] {
    const prereqIds = this.graph.reverseAdjacencyList.get(skillId) || new Set();
    return Array.from(prereqIds)
      .map(id => this.graph.nodes.get(id))
      .filter((skill): skill is Skill => skill !== undefined);
  }

  getDependents(skillId: string): Skill[] {
    const dependentIds = this.graph.adjacencyList.get(skillId) || new Set();
    return Array.from(dependentIds)
      .map(id => this.graph.nodes.get(id))
      .filter((skill): skill is Skill => skill !== undefined);
  }

  hasCycle(): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycleDFS = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) {
        return true;
      }
      if (visited.has(nodeId)) {
        return false;
      }

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const neighbors = this.graph.adjacencyList.get(nodeId) || new Set();
      for (const neighbor of neighbors) {
        if (hasCycleDFS(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const nodeId of this.graph.nodes.keys()) {
      if (!visited.has(nodeId)) {
        if (hasCycleDFS(nodeId)) {
          return true;
        }
      }
    }

    return false;
  }

  validateGraph(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const [skillId, skill] of this.graph.nodes) {
      for (const prereqId of skill.prerequisites) {
        if (!this.graph.nodes.has(prereqId)) {
          errors.push(`Skill ${skillId} references non-existent prerequisite ${prereqId}`);
        }
      }
    }

    if (this.hasCycle()) {
      errors.push('Graph contains cycles, which violates DAG requirements');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  getSkillsByCategory(category: string): Skill[] {
    return this.getAllSkills().filter(skill => skill.category === category);
  }

  getSkillsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'): Skill[] {
    return this.getAllSkills().filter(skill => skill.difficulty === difficulty);
  }

  getSkillsByTag(tag: string): Skill[] {
    return this.getAllSkills().filter(skill => skill.tags.includes(tag));
  }

  getGraph(): SkillGraph {
    return { ...this.graph };
  }

  clone(): SkillGraphManager {
    const newGraph = new SkillGraphManager();
    for (const skill of this.getAllSkills()) {
      newGraph.addSkill({ ...skill });
    }
    return newGraph;
  }

  // Enhanced DAG methods
  getLongestPath(sourceId?: string): { path: string[]; totalHours: number } {
    const distances = new Map<string, number>();
    const predecessors = new Map<string, string | null>();
    
    // Initialize distances
    for (const skillId of this.graph.nodes.keys()) {
      distances.set(skillId, sourceId === skillId ? 0 : -Infinity);
      predecessors.set(skillId, null);
    }

    // Topological sort
    const sorted = this.topologicalSort();
    
    // Relax edges
    for (const u of sorted) {
      if (distances.get(u)! === -Infinity) continue;
      
      const neighbors = this.graph.adjacencyList.get(u) || new Set();
      for (const v of neighbors) {
        const uSkill = this.graph.nodes.get(u)!;
        const vSkill = this.graph.nodes.get(v)!;
        const weight = vSkill.estimatedHours;
        
        if (distances.get(u)! + weight > distances.get(v)!) {
          distances.set(v, distances.get(u)! + weight);
          predecessors.set(v, u);
        }
      }
    }

    // Find longest path
    let maxDistance = 0;
    let endNode = sourceId || '';
    for (const [node, distance] of distances) {
      if (distance > maxDistance) {
        maxDistance = distance;
        endNode = node;
      }
    }

    // Reconstruct path
    const path: string[] = [];
    let current: string | null = endNode;
    while (current !== null) {
      path.unshift(current);
      current = predecessors.get(current) || null;
    }

    return { path, totalHours: maxDistance };
  }

  getCriticalPath(): { path: string[]; totalHours: number } {
    return this.getLongestPath();
  }

  topologicalSort(): string[] {
    const inDegree = new Map<string, number>();
    const queue: string[] = [];
    const result: string[] = [];

    // Calculate in-degrees
    for (const skillId of this.graph.nodes.keys()) {
      inDegree.set(skillId, 0);
    }

    for (const [from, neighbors] of this.graph.edges) {
      for (const to of neighbors) {
        inDegree.set(to, (inDegree.get(to) || 0) + 1);
      }
    }

    // Find nodes with no incoming edges
    for (const [skillId, degree] of inDegree) {
      if (degree === 0) {
        queue.push(skillId);
      }
    }

    // Process queue
    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);

      const neighbors = this.graph.adjacencyList.get(current) || new Set();
      for (const neighbor of neighbors) {
        const newDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, newDegree);
        
        if (newDegree === 0) {
          queue.push(neighbor);
        }
      }
    }

    return result;
  }

  getLevels(): string[][] {
    const levels: string[][] = [];
    const visited = new Set<string>();
    const sorted = this.topologicalSort();
    
    const skillToLevel = new Map<string, number>();
    
    for (const skillId of sorted) {
      const prereqs = this.getPrerequisites(skillId);
      if (prereqs.length === 0) {
        skillToLevel.set(skillId, 0);
      } else {
        const maxPrereqLevel = Math.max(...prereqs.map(p => skillToLevel.get(p.id) || 0));
        skillToLevel.set(skillId, maxPrereqLevel + 1);
      }
    }

    // Group by level
    const levelToSkills = new Map<number, string[]>();
    for (const [skillId, level] of skillToLevel) {
      if (!levelToSkills.has(level)) {
        levelToSkills.set(level, []);
      }
      levelToSkills.get(level)!.push(skillId);
    }

    // Sort levels
    const sortedLevels = Array.from(levelToSkills.keys()).sort((a, b) => a - b);
    return sortedLevels.map(level => levelToSkills.get(level)!);
  }

  getGraphMetrics(): {
    totalNodes: number;
    totalEdges: number;
    maxDepth: number;
    avgBranchingFactor: number;
    criticalPathLength: number;
  } {
    const totalNodes = this.graph.nodes.size;
    let totalEdges = 0;
    
    for (const neighbors of this.graph.edges.values()) {
      totalEdges += neighbors.size;
    }

    const levels = this.getLevels();
    const maxDepth = levels.length;
    
    const avgBranchingFactor = totalNodes > 0 ? totalEdges / totalNodes : 0;
    const criticalPathLength = this.getCriticalPath().path.length;

    return {
      totalNodes,
      totalEdges,
      maxDepth,
      avgBranchingFactor,
      criticalPathLength
    };
  }
}
