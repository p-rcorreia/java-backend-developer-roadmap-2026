<script setup lang="ts">
import { BookOpenCheck, CircleDot, ListChecks, Trophy } from "lucide-vue-next";
import ProgressBar from "./ProgressBar.vue";

defineProps<{
  percent: number;
  total: number;
  completed: number;
  studying: number;
  notStarted: number;
}>();
</script>

<template>
  <section class="panel overflow-hidden">
    <div class="grid gap-6 p-5 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
            <Trophy class="h-6 w-6" />
          </div>
          <div>
            <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">Progresso geral</p>
            <p class="text-4xl font-black text-slate-950 dark:text-white">{{ percent }}%</p>
          </div>
        </div>
        <div class="mt-5">
          <ProgressBar :value="percent" color-class="bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-400" height="h-4" />
        </div>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <div class="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950/40">
          <BookOpenCheck class="mb-3 h-5 w-5 text-emerald-700 dark:text-emerald-300" />
          <p class="text-2xl font-black text-slate-950 dark:text-white">{{ completed }}</p>
          <p class="text-xs font-semibold text-slate-600 dark:text-slate-300">Concluídos</p>
        </div>
        <div class="rounded-2xl bg-amber-50 p-4 dark:bg-amber-950/40">
          <CircleDot class="mb-3 h-5 w-5 text-amber-700 dark:text-amber-300" />
          <p class="text-2xl font-black text-slate-950 dark:text-white">{{ studying }}</p>
          <p class="text-xs font-semibold text-slate-600 dark:text-slate-300">Andamento</p>
        </div>
        <div class="rounded-2xl bg-slate-100 p-4 dark:bg-slate-900">
          <ListChecks class="mb-3 h-5 w-5 text-slate-600 dark:text-slate-300" />
          <p class="text-2xl font-black text-slate-950 dark:text-white">{{ notStarted }}</p>
          <p class="text-xs font-semibold text-slate-600 dark:text-slate-300">Pendentes</p>
        </div>
      </div>
    </div>
    <div class="border-t border-slate-200 px-5 py-3 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
      {{ total }} tópicos na jornada, com subtópicos granulares para marcar avanço real.
    </div>
  </section>
</template>
