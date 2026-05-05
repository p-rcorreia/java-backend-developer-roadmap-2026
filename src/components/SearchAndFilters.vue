<script setup lang="ts">
import { Filter, Heart, Search } from "lucide-vue-next";
import type { RoadmapCategory } from "@/types/roadmap";
import type { RoadmapFilters } from "@/types/roadmap";

defineProps<{ modelValue: RoadmapFilters; categories: RoadmapCategory[] }>();
defineEmits<{ "update:modelValue": [filters: RoadmapFilters] }>();

const update = (filters: RoadmapFilters, patch: Partial<RoadmapFilters>) => ({ ...filters, ...patch });
</script>

<template>
  <section class="panel p-4">
    <div class="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
      <label class="relative">
        <Search class="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input class="input pl-9" :value="modelValue.search" placeholder="Buscar tópico ou subtópico..." @input="$emit('update:modelValue', update(modelValue, { search: ($event.target as HTMLInputElement).value }))" />
      </label>

      <select class="input" :value="modelValue.category" @change="$emit('update:modelValue', update(modelValue, { category: ($event.target as HTMLSelectElement).value }))">
        <option value="all">Todas as categorias</option>
        <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.title }}</option>
      </select>

      <select class="input" :value="modelValue.status" @change="$emit('update:modelValue', update(modelValue, { status: ($event.target as HTMLSelectElement).value as RoadmapFilters['status'] }))">
        <option value="all">Todos os status</option>
        <option value="not-started">Não iniciado</option>
        <option value="studying">Estudando</option>
        <option value="completed">Concluído</option>
      </select>

      <select class="input" :value="modelValue.level" @change="$emit('update:modelValue', update(modelValue, { level: ($event.target as HTMLSelectElement).value as RoadmapFilters['level'] }))">
        <option value="all">Todos os níveis</option>
        <option value="básico">Básico</option>
        <option value="intermediário">Intermediário</option>
        <option value="avançado">Avançado</option>
      </select>
    </div>

    <div class="mt-3 flex flex-wrap gap-2">
      <button
        class="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition"
        :class="modelValue.favoritesOnly ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200' : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'"
        @click="$emit('update:modelValue', update(modelValue, { favoritesOnly: !modelValue.favoritesOnly }))"
      >
        <Heart class="h-4 w-4" />
        Favoritos
      </button>
      <button
        class="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition"
        :class="modelValue.pendingOnly ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200' : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'"
        @click="$emit('update:modelValue', update(modelValue, { pendingOnly: !modelValue.pendingOnly }))"
      >
        <Filter class="h-4 w-4" />
        Apenas pendentes
      </button>
    </div>
  </section>
</template>
