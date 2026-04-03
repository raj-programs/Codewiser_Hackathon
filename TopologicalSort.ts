import { Skill, SkillGraph } from './index';

export class TopologicalSort {
  static sort(skillGraph: SkillGraph): string[] {
    const inDegree = new Map<string, number>();
    const result: string[] = [];
    const queue: string[] = [];

    for (const skillId of skillGraph.nodes.keys()) {
      inDegree.set(skillId, 0);
    }

    for (const [from, toSet] of skillGraph.edges) {
      for (const to of toSet) {
        inDegree.set(to, (inDegree.get(to) || 0) + 1);
      }
    }

    for (const [skillId, degree] of inDegree) {
      if (degree === 0) {
        queue.push(skillId);
      }
    }

    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);

      const neighbors = skillGraph.adjacencyList.get(current) || new Set();
      for (const neighbor of neighbors) {
        const newDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) {
          queue.push(neighbor);
        }
      }
    }

    if (result.length !== skillGraph.nodes.size) {
      throw new Error('Graph contains a cycle, topological sort not possible');
    }

    return result;
  }

  static sortSubset(skillGraph: SkillGraph, skillIds: Set<string>): string[] {
    const subgraph = this.extractSubgraph(skillGraph, skillIds);
    return this.sort(subgraph);
  }

  static extractSubgraph(skillGraph: SkillGraph, skillIds: Set<string>): SkillGraph {
    const subgraph: SkillGraph = {
      nodes: new Map(),
      edges: new Map(),
      adjacencyList: new Map(),
      reverseAdjacencyList: new Map()
    };

    for (const skillId of skillIds) {
      const skill = skillGraph.nodes.get(skillId);
      if (skill) {
        subgraph.nodes.set(skillId, skill);
        subgraph.adjacencyList.set(skillId, new Set());
        subgraph.reverseAdjacencyList.set(skillId, new Set());
      }
    }

    for (const [from, toSet] of skillGraph.edges) {
      if (skillIds.has(from)) {
        const filteredToSet = new Set(Array.from(toSet).filter(to => skillIds.has(to)));
        if (filteredToSet.size > 0) {
          subgraph.edges.set(from, filteredToSet);
          
          for (const to of filteredToSet) {
            subgraph.adjacencyList.get(from)!.add(to);
            if (!subgraph.reverseAdjacencyList.has(to)) {
              subgraph.reverseAdjacencyList.set(to, new Set());
            }
            subgraph.reverseAdjacencyList.get(to)!.add(from);
          }
        }
      }
    }

    return subgraph;
  }

  static getLevels(skillGraph: SkillGraph): Map<string, number> {
    const sorted = this.sort(skillGraph);
    const levels = new Map<string, number>();
    const skillLevels = new Map<string, number>();

    for (const skillId of sorted) {
      const skill = skillGraph.nodes.get(skillId);
      if (!skill) continue;

      let maxPrereqLevel = -1;
      for (const prereqId of skill.prerequisites) {
        const prereqLevel = skillLevels.get(prereqId) || 0;
        maxPrereqLevel = Math.max(maxPrereqLevel, prereqLevel);
      }
      
      const currentLevel = maxPrereqLevel + 1;
      skillLevels.set(skillId, currentLevel);
      
      if (!levels.has(currentLevel.toString())) {
        levels.set(currentLevel.toString(), 0);
      }
      levels.set(currentLevel.toString(), levels.get(currentLevel.toString())! + 1);
    }

    return skillLevels;
  }

  static getSkillLevel(skillGraph: SkillGraph, skillId: string): number {
    const levels = this.getLevels(skillGraph);
    return levels.get(skillId) || 0;
  }

  static validatePartialOrder(skillGraph: SkillGraph, skillIds: string[]): boolean {
    try {
      const sorted = this.sortSubset(skillGraph, new Set(skillIds));
      return sorted.length === skillIds.length;
    } catch {
      return false;
    }
  }
}
