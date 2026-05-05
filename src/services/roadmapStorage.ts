import type { RoadmapFilters, RoadmapProgress, TopicProgress, TopicStatus } from "@/types/roadmap";

const STORAGE_KEY = "java-backend-roadmap-2026";

export const defaultFilters: RoadmapFilters = {
  search: "",
  category: "all",
  status: "all",
  level: "all",
  favoritesOnly: false,
  pendingOnly: false,
};

export const createEmptyTopicProgress = (): TopicProgress => ({
  status: "not-started",
  completedSubtopics: [],
  notes: "",
  favorite: false,
});

export const defaultProgress = (): RoadmapProgress => ({
  topics: {},
  filters: { ...defaultFilters },
  darkMode: false,
});

export function loadProgress(): RoadmapProgress {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultProgress();

  try {
    const parsed = JSON.parse(raw) as Partial<RoadmapProgress>;
    return {
      topics: parsed.topics ?? {},
      filters: { ...defaultFilters, ...(parsed.filters ?? {}) },
      darkMode: Boolean(parsed.darkMode),
    };
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(progress: RoadmapProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function normalizeStatus(status: TopicStatus, completed: number, total: number): TopicStatus {
  if (total > 0 && completed === total) return "completed";
  if (status === "completed" && completed < total) return completed > 0 ? "studying" : "not-started";
  if (completed > 0 && status === "not-started") return "studying";
  return status;
}

export function exportProgress(progress: RoadmapProgress) {
  const blob = new Blob([JSON.stringify(progress, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "java-backend-roadmap-2026-progress.json";
  link.click();
  URL.revokeObjectURL(url);
}

export async function importProgress(file: File): Promise<RoadmapProgress> {
  const text = await file.text();
  const parsed = JSON.parse(text) as RoadmapProgress;
  return {
    topics: parsed.topics ?? {},
    filters: { ...defaultFilters, ...(parsed.filters ?? {}) },
    darkMode: Boolean(parsed.darkMode),
  };
}
