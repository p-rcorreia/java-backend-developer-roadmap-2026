<script setup lang="ts">
import type { RoadmapCategory } from "@/types/roadmap";
import { colorClasses, iconMap } from "@/utils/roadmapUi";
import ProgressBar from "./ProgressBar.vue";

defineProps<{ category: RoadmapCategory; progress: number; completed: number; total: number; active?: boolean }>();
defineEmits<{ select: [id: string] }>();
</script>

<template>
  <button
    class="w-full rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
    :class="[colorClasses[category.color].soft, colorClasses[category.color].border, active ? `ring-4 ${colorClasses[category.color].ring}` : '']"
    @click="$emit('select', category.id)"
  >
    <div class="flex items-start gap-3">
      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white" :class="colorClasses[category.color].bg">
        <component :is="iconMap[category.icon]" class="h-5 w-5" />
      </div>
      <div class="min-w-0 flex-1">
        <h3 class="text-sm font-black text-slate-950 dark:text-white">{{ category.title }}</h3>
        <p class="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">{{ category.description }}</p>
      </div>
      <span class="text-sm font-black" :class="colorClasses[category.color].text">{{ progress }}%</span>
    </div>
    <div class="mt-4">
      <ProgressBar :value="progress" :color-class="colorClasses[category.color].bg" />
      <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">{{ completed }} de {{ total }} tópicos concluídos</p>
    </div>
  </button>
</template>
