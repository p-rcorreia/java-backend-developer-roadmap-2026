export type TopicStatus = "not-started" | "studying" | "completed";
export type TopicLevel = "básico" | "intermediário" | "avançado";

export interface RoadmapTopic {
  id: string;
  title: string;
  level: TopicLevel;
  description: string;
  whyItMatters: string;
  practicalGoal: string;
  exercise: string;
  subtopics: string[];
}

export interface RoadmapCategory {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: string;
  topics: RoadmapTopic[];
}

export interface TopicProgress {
  status: TopicStatus;
  completedSubtopics: string[];
  notes: string;
  favorite: boolean;
}

export interface RoadmapProgress {
  topics: Record<string, TopicProgress>;
  filters: RoadmapFilters;
  darkMode: boolean;
}

export interface RoadmapFilters {
  search: string;
  category: string;
  status: TopicStatus | "all";
  level: TopicLevel | "all";
  favoritesOnly: boolean;
  pendingOnly: boolean;
}

export interface TopicWithCategory extends RoadmapTopic {
  categoryId: string;
  categoryTitle: string;
  categoryColor: string;
  categoryIcon: string;
}
