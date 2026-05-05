<script setup lang="ts">
import type { RoadmapCategory } from "@/types/roadmap";
import CategoryCard from "./CategoryCard.vue";

defineProps<{
  categories: RoadmapCategory[];
  selectedCategory: string;
  stats: Record<string, { progress: number; completed: number; total: number }>;
}>();
defineEmits<{ select: [id: string] }>();
</script>

<template>
  <aside class="space-y-3">
    <button
      class="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left text-sm font-black text-slate-900 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-900"
      :class="{ 'ring-4 ring-slate-200 dark:ring-slate-800': selectedCategory === 'all' }"
      @click="$emit('select', 'all')"
    >
      Todas as trilhas
    </button>
    <CategoryCard
      v-for="category in categories"
      :key="category.id"
      :category="category"
      :progress="stats[category.id]?.progress ?? 0"
      :completed="stats[category.id]?.completed ?? 0"
      :total="stats[category.id]?.total ?? 0"
      :active="selectedCategory === category.id"
      @select="$emit('select', $event)"
    />
  </aside>
</template>
