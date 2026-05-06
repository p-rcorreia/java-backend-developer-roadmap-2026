<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import AppHeader from "@/components/AppHeader.vue";
import ProgressOverview from "@/components/ProgressOverview.vue";
import SearchAndFilters from "@/components/SearchAndFilters.vue";
import Sidebar from "@/components/Sidebar.vue";
import TopicCard from "@/components/TopicCard.vue";
import TopicDetailsModal from "@/components/TopicDetailsModal.vue";
import { roadmap } from "@/data/roadmap";
import {
  createEmptyTopicProgress,
  defaultProgress,
  exportProgress,
  importProgress,
  loadProgress,
  normalizeStatus,
  saveProgress,
} from "@/services/roadmapStorage";
import { loadRemoteProgress, saveRemoteProgress } from "@/services/progressBackup";
import type { RoadmapFilters, RoadmapProgress, TopicProgress, TopicStatus, TopicWithCategory } from "@/types/roadmap";
import { colorClasses, iconMap, percent } from "@/utils/roadmapUi";

const progress = reactive<RoadmapProgress>(loadProgress());
const expandedTopics = ref<Set<string>>(new Set());
const selectedTopicId = ref<string | null>(null);
const remoteBackupReady = ref(false);
let remoteSaveTimer: number | undefined;

const navigationCategories = computed(() => roadmap.filter((category) => category.id !== "design-patterns"));
const architectureCategory = computed(() => roadmap.find((category) => category.id === "architecture"));

const allTopics = computed<TopicWithCategory[]>(() =>
  roadmap.flatMap((category) =>
    category.topics.map((topic) => {
      if (category.id === "design-patterns" && architectureCategory.value) {
        return {
          ...topic,
          group: topic.group ? `Design Patterns - ${topic.group}` : "Design Patterns",
          categoryId: architectureCategory.value.id,
          categoryTitle: architectureCategory.value.title,
          categoryColor: architectureCategory.value.color,
          categoryIcon: architectureCategory.value.icon,
        };
      }

      return {
        ...topic,
        categoryId: category.id,
        categoryTitle: category.title,
        categoryColor: category.color,
        categoryIcon: category.icon,
      };
    }),
  ),
);

const topicById = computed(() => new Map(allTopics.value.map((topic) => [topic.id, topic])));
const selectedTopic = computed(() => (selectedTopicId.value ? topicById.value.get(selectedTopicId.value) ?? null : null));

function ensureTopicProgress(topicId: string): TopicProgress {
  if (!progress.topics[topicId]) {
    progress.topics[topicId] = createEmptyTopicProgress();
  }
  return progress.topics[topicId];
}

function getTopicProgress(topicId: string) {
  return progress.topics[topicId] ?? createEmptyTopicProgress();
}

function sanitizeProgress() {
  for (const [topicId, item] of Object.entries(progress.topics)) {
    const topic = topicById.value.get(topicId);
    if (!topic) continue;

    const validSubtopics = new Set(topic.subtopics);
    const sanitizedSubtopics = item.completedSubtopics.filter((subtopic, index, current) => validSubtopics.has(subtopic) && current.indexOf(subtopic) === index);

    item.completedSubtopics = sanitizedSubtopics;
    item.status = normalizeStatus(item.status, sanitizedSubtopics.length, topic.subtopics.length);
  }
}

function setStatus(topicId: string, status: TopicStatus) {
  const item = ensureTopicProgress(topicId);
  const topic = topicById.value.get(topicId);
  item.status = status;
  if (status === "completed" && topic) item.completedSubtopics = [...topic.subtopics];
  if (status === "not-started") item.completedSubtopics = [];
}

function toggleSubtopic(topicId: string, subtopic: string) {
  const item = ensureTopicProgress(topicId);
  const topic = topicById.value.get(topicId);
  if (!topic) return;

  item.completedSubtopics = item.completedSubtopics.includes(subtopic)
    ? item.completedSubtopics.filter((current) => current !== subtopic)
    : [...item.completedSubtopics, subtopic];
  item.status = normalizeStatus(item.status, item.completedSubtopics.length, topic.subtopics.length);
}

function toggleFavorite(topicId: string) {
  const item = ensureTopicProgress(topicId);
  item.favorite = !item.favorite;
}

function setNotes(topicId: string, notes: string) {
  ensureTopicProgress(topicId).notes = notes;
}

function toggleExpanded(topicId: string) {
  const next = new Set(expandedTopics.value);
  if (next.has(topicId)) next.delete(topicId);
  else next.add(topicId);
  expandedTopics.value = next;
}

const summary = computed(() => {
  const total = allTopics.value.length;
  const completed = allTopics.value.filter((topic) => getTopicProgress(topic.id).status === "completed").length;
  const studying = allTopics.value.filter((topic) => getTopicProgress(topic.id).status === "studying").length;
  const notStarted = total - completed - studying;

  return {
    total,
    completed,
    studying,
    notStarted,
    percent: percent(completed, total),
  };
});

const categoryStats = computed(() =>
  Object.fromEntries(
    navigationCategories.value.map((category) => {
      const topics = allTopics.value.filter((topic) => topic.categoryId === category.id);
      const total = topics.length;
      const completed = topics.filter((topic) => getTopicProgress(topic.id).status === "completed").length;
      return [category.id, { total, completed, progress: percent(completed, total) }];
    }),
  ),
);

const visibleTopics = computed(() => {
  const filters = progress.filters;
  const term = filters.search.trim().toLocaleLowerCase("pt-BR");

  return allTopics.value.filter((topic) => {
    const item = getTopicProgress(topic.id);
    const matchesSearch =
      !term ||
      topic.title.toLocaleLowerCase("pt-BR").includes(term) ||
      topic.description.toLocaleLowerCase("pt-BR").includes(term) ||
      topic.subtopics.some((subtopic) => subtopic.toLocaleLowerCase("pt-BR").includes(term));
    const matchesCategory = filters.category === "all" || topic.categoryId === filters.category;
    const matchesStatus = filters.status === "all" || item.status === filters.status;
    const matchesLevel = filters.level === "all" || topic.level === filters.level;
    const matchesFavorite = !filters.favoritesOnly || item.favorite;
    const matchesPending = !filters.pendingOnly || item.status !== "completed";
    return matchesSearch && matchesCategory && matchesStatus && matchesLevel && matchesFavorite && matchesPending;
  });
});

const groupedVisibleSections = computed(() => {
  const sections = new Map<string, { key: string; title: string; subtitle: string; color: string; topics: TopicWithCategory[] }>();

  visibleTopics.value.forEach((topic) => {
    const title = topic.group ?? topic.categoryTitle;
    const subtitle = topic.group ? topic.categoryTitle : "Trilha principal";
    const key = `${topic.categoryId}:${title}`;

    if (!sections.has(key)) {
      sections.set(key, {
        key,
        title,
        subtitle,
        color: topic.categoryColor,
        topics: [],
      });
    }

    sections.get(key)?.topics.push(topic);
  });

  return Array.from(sections.values());
});

const totalSubtopics = computed(() => allTopics.value.reduce((total, topic) => total + topic.subtopics.length, 0));

function updateFilters(filters: RoadmapFilters) {
  progress.filters = filters;
}

function selectCategory(categoryId: string) {
  progress.filters = { ...progress.filters, category: categoryId };
}

function toggleTheme() {
  progress.darkMode = !progress.darkMode;
}

function resetProgress() {
  if (!confirm("Resetar todo o progresso salvo neste navegador?")) return;
  const fresh = defaultProgress();
  progress.topics = fresh.topics;
  progress.filters = fresh.filters;
  progress.darkMode = fresh.darkMode;
  expandedTopics.value = new Set();
  selectedTopicId.value = null;
}

async function handleImport(file: File) {
  try {
    const imported = await importProgress(file);
    progress.topics = imported.topics;
    progress.filters = imported.filters;
    progress.darkMode = imported.darkMode;
    sanitizeProgress();
  } catch {
    alert("Não foi possível importar o JSON de progresso.");
  }
}

sanitizeProgress();

onMounted(async () => {
  const remoteProgress = await loadRemoteProgress();
  if (remoteProgress) {
    progress.topics = remoteProgress.topics;
    progress.filters = remoteProgress.filters;
    progress.darkMode = remoteProgress.darkMode;
    sanitizeProgress();
  }
  remoteBackupReady.value = true;
  await saveRemoteProgress(progress);
});

watch(
  progress,
  (current) => {
    saveProgress(current);
    document.documentElement.classList.toggle("dark", current.darkMode);

    if (!remoteBackupReady.value) return;
    window.clearTimeout(remoteSaveTimer);
    remoteSaveTimer = window.setTimeout(() => {
      void saveRemoteProgress(current);
    }, 600);
  },
  { deep: true, immediate: true },
);
</script>

<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0,transparent_30%),linear-gradient(180deg,#f8fafc,#eef2f7)] text-slate-900 dark:bg-[radial-gradient(circle_at_top_left,#172554_0,transparent_28%),linear-gradient(180deg,#020617,#0f172a)] dark:text-slate-100">
    <AppHeader
      :dark-mode="progress.darkMode"
      @toggle-theme="toggleTheme"
      @export="exportProgress(progress)"
      @import="handleImport"
      @reset="resetProgress"
    />

    <main class="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[320px_1fr] lg:px-8">
      <Sidebar :categories="navigationCategories" :selected-category="progress.filters.category" :stats="categoryStats" @select="selectCategory" />

      <div class="space-y-6">
        <ProgressOverview
          :percent="summary.percent"
          :total="summary.total"
          :completed="summary.completed"
          :studying="summary.studying"
          :not-started="summary.notStarted"
        />

        <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div
            v-for="category in navigationCategories"
            :key="category.id"
            class="rounded-2xl border p-4"
            :class="[colorClasses[category.color].soft, colorClasses[category.color].border]"
          >
            <div class="mb-3 flex items-center gap-2">
              <component :is="iconMap[category.icon]" class="h-4 w-4" :class="colorClasses[category.color].text" />
              <p class="text-sm font-black text-slate-950 dark:text-white">{{ category.title }}</p>
            </div>
            <p class="text-2xl font-black" :class="colorClasses[category.color].text">{{ categoryStats[category.id]?.progress ?? 0 }}%</p>
          </div>
        </section>

        <SearchAndFilters :model-value="progress.filters" :categories="navigationCategories" @update:model-value="updateFilters" />

        <section class="space-y-4">
          <div class="flex items-end justify-between gap-3">
            <div>
              <h2 class="text-xl font-black text-slate-950 dark:text-white">Roadmap</h2>
              <p class="text-sm text-slate-600 dark:text-slate-300">
                {{ visibleTopics.length }} tópicos encontrados em {{ groupedVisibleSections.length }} seções, com {{ totalSubtopics }} subtópicos no total
              </p>
            </div>
          </div>

          <div v-if="visibleTopics.length" class="grid gap-4">
            <section v-for="section in groupedVisibleSections" :key="section.key" class="space-y-3">
              <div class="flex items-center gap-3 rounded-2xl border bg-white/80 px-4 py-3 dark:bg-slate-950/70" :class="colorClasses[section.color].border">
                <span class="h-2.5 w-2.5 rounded-full" :class="colorClasses[section.color].bg" />
                <div>
                  <h3 class="text-sm font-black text-slate-950 dark:text-white">{{ section.title }}</h3>
                  <p class="text-xs font-semibold text-slate-500 dark:text-slate-400">{{ section.subtitle }} · {{ section.topics.length }} tópicos</p>
                </div>
              </div>

              <TopicCard
                v-for="topic in section.topics"
                :key="topic.id"
                :topic="topic"
                :status="getTopicProgress(topic.id).status"
                :completed-subtopics="getTopicProgress(topic.id).completedSubtopics"
                :favorite="getTopicProgress(topic.id).favorite"
                :expanded="expandedTopics.has(topic.id)"
                @status="setStatus(topic.id, $event)"
                @toggle-subtopic="toggleSubtopic(topic.id, $event)"
                @toggle-favorite="toggleFavorite(topic.id)"
                @toggle-expand="toggleExpanded(topic.id)"
                @open-details="selectedTopicId = topic.id"
              />
            </section>
          </div>

          <div v-else class="panel p-8 text-center">
            <p class="text-lg font-black text-slate-950 dark:text-white">Nenhum tópico encontrado</p>
            <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">Ajuste os filtros para voltar para a trilha.</p>
          </div>
        </section>
      </div>
    </main>

    <TopicDetailsModal
      :topic="selectedTopic"
      :status="selectedTopic ? getTopicProgress(selectedTopic.id).status : 'not-started'"
      :completed-subtopics="selectedTopic ? getTopicProgress(selectedTopic.id).completedSubtopics : []"
      :notes="selectedTopic ? getTopicProgress(selectedTopic.id).notes : ''"
      @close="selectedTopicId = null"
      @status="selectedTopic && setStatus(selectedTopic.id, $event)"
      @toggle-subtopic="selectedTopic && toggleSubtopic(selectedTopic.id, $event)"
      @notes="selectedTopic && setNotes(selectedTopic.id, $event)"
    />
  </div>
</template>
