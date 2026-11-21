/**
 * Topics planned for the app, in the order they will be added. Shown in the sidebar under
 * "Coming next". When a topic ships (as a track, guide or topic), remove it from this list.
 */
export interface RoadmapItem {
  id: string;
  title: string;
}

export const roadmap: RoadmapItem[] = [
  { id: 'ci-cd', title: 'CI/CD' },
  { id: 'mcp', title: 'MCP' },
  { id: 'redis', title: 'Redis' },
  { id: 'pydantic', title: 'Pydantic' },
  { id: 'linux-basics', title: 'Linux (basics)' },
  { id: 'backend-system-design', title: 'Backend system design' },
  { id: 'frontend-system-design', title: 'Frontend system design' },
  { id: 'vector-database', title: 'Vector database' },
  { id: 'rag', title: 'RAG' },
  { id: 'ai-engineering-fundamentals', title: 'AI engineering fundamentals' },
  { id: 'ai-governance', title: 'AI governance' },
];
