<script setup lang="ts">
import { ChevronDown, ChevronUp, Heart, PanelTopOpen } from "lucide-vue-next";
import type { TopicStatus, TopicWithCategory } from "@/types/roadmap";
import { colorClasses } from "@/utils/roadmapUi";
import ProgressBar from "./ProgressBar.vue";
import StatusBadge from "./StatusBadge.vue";
import SubtopicChecklist from "./SubtopicChecklist.vue";

defineProps<{
  topic: TopicWithCategory;
  status: TopicStatus;
  completedSubtopics: string[];
  favorite: boolean;
  expanded: boolean;
}>();

defineEmits<{
  status: [status: TopicStatus];
  toggleSubtopic: [subtopic: string];
  toggleFavorite: [];
  toggleExpand: [];
  openDetails: [];
}>();
</script>

<template>
  <article
    class="panel overflow-hidden transition duration-300"
    :class="status === 'completed' ? 'opacity-75 ring-1 ring-emerald-200 dark:ring-emerald-900' : ''"
  >
    <div class="border-l-4 p-4" :class="colorClasses[topic.categoryColor].border">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <div class="mb-2 flex flex-wrap items-center gap-2">
            <span class="rounded-full px-2.5 py-1 text-xs font-bold" :class="[colorClasses[topic.categoryColor].soft, colorClasses[topic.categoryColor].text]">{{ topic.categoryTitle }}</span>
            <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ topic.level }}</span>
            <StatusBadge :status="status" />
          </div>
          <h3 class="text-lg font-black text-slate-950 dark:text-white">{{ topic.title }}</h3>
          <p class="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{{ topic.description }}</p>
        </div>

        <button class="icon-button shrink-0" :title="favorite ? 'Remover favorito' : 'Adicionar favorito'" @click="$emit('toggleFavorite')">
          <Heart class="h-4 w-4" :class="favorite ? 'fill-rose-500 text-rose-500' : ''" />
        </button>
      </div>

      <div class="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <ProgressBar :value="Math.round((completedSubtopics.length / topic.subtopics.length) * 100)" :color-class="colorClasses[topic.categoryColor].bg" />
          <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">{{ completedSubtopics.length }} de {{ topic.subtopics.length }} subtópicos</p>
        </div>

        <select class="input sm:w-44" :value="status" @change="$emit('status', ($event.target as HTMLSelectElement).value as TopicStatus)">
          <option value="not-started">Não iniciado</option>
          <option value="studying">Estudando</option>
          <option value="completed">Concluído</option>
        </select>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <button class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800" @click="$emit('toggleExpand')">
          <ChevronUp v-if="expanded" class="h-4 w-4" />
          <ChevronDown v-else class="h-4 w-4" />
          Subtópicos
        </button>
        <button class="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200" @click="$emit('openDetails')">
          <PanelTopOpen class="h-4 w-4" />
          Detalhes
        </button>
      </div>

      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="-translate-y-1 opacity-0" enter-to-class="translate-y-0 opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="translate-y-0 opacity-100" leave-to-class="-translate-y-1 opacity-0">
        <div v-if="expanded" class="mt-4">
          <SubtopicChecklist :subtopics="topic.subtopics" :completed="completedSubtopics" compact @toggle="$emit('toggleSubtopic', $event)" />
        </div>
      </Transition>
    </div>
  </article>
</template>
