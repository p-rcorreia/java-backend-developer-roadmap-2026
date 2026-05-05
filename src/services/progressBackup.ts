import type { RoadmapProgress } from "@/types/roadmap";
import { defaultFilters } from "@/services/roadmapStorage";

const API_URL = "/api/progress";

export async function loadRemoteProgress(): Promise<RoadmapProgress | null> {
  try {
    const response = await fetch(API_URL, { cache: "no-store" });
    if (!response.ok) return null;
    const parsed = (await response.json()) as Partial<RoadmapProgress> | null;
    if (!parsed) return null;

    return {
      topics: parsed.topics ?? {},
      filters: { ...defaultFilters, ...(parsed.filters ?? {}) },
      darkMode: Boolean(parsed.darkMode),
    };
  } catch {
    return null;
  }
}

export async function saveRemoteProgress(progress: RoadmapProgress) {
  try {
    await fetch(API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(progress),
    });
  } catch {
    // The API only exists in Docker/local-server mode. Vite dev keeps working without it.
  }
}
