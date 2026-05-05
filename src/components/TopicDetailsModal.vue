<script setup lang="ts">
import { X } from "lucide-vue-next";
import type { TopicStatus, TopicWithCategory } from "@/types/roadmap";
import { colorClasses } from "@/utils/roadmapUi";
import StatusBadge from "./StatusBadge.vue";
import SubtopicChecklist from "./SubtopicChecklist.vue";

defineProps<{
  topic: TopicWithCategory | null;
  status: TopicStatus;
  completedSubtopics: string[];
  notes: string;
}>();

defineEmits<{
  close: [];
  status: [status: TopicStatus];
  notes: [notes: string];
  toggleSubtopic: [subtopic: string];
}>();
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="topic" class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm" @click.self="$emit('close')">
        <div class="mx-auto my-8 max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-950">
          <div class="border-b border-slate-200 p-5 dark:border-slate-800">
            <div class="flex items-start justify-between gap-4">
              <div>
                <span class="rounded-full px-2.5 py-1 text-xs font-bold" :class="[colorClasses[topic.categoryColor].soft, colorClasses[topic.categoryColor].text]">{{ topic.categoryTitle }}</span>
                <h2 class="mt-3 text-2xl font-black text-slate-950 dark:text-white">{{ topic.title }}</h2>
                <div class="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge :status="status" />
                  <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ topic.level }}</span>
                </div>
              </div>
              <button class="icon-button" title="Fechar" @click="$emit('close')">
                <X class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div class="grid gap-5 p-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div class="space-y-4">
              <section>
                <h3 class="text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">O que é</h3>
                <p class="mt-2 leading-7 text-slate-700 dark:text-slate-200">{{ topic.description }}</p>
              </section>
              <section>
                <h3 class="text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Por que importa</h3>
                <p class="mt-2 leading-7 text-slate-700 dark:text-slate-200">{{ topic.whyItMatters }}</p>
              </section>
              <section>
                <h3 class="text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Na prática</h3>
                <p class="mt-2 leading-7 text-slate-700 dark:text-slate-200">{{ topic.practicalGoal }}</p>
              </section>
              <section class="rounded-2xl bg-slate-100 p-4 dark:bg-slate-900">
                <h3 class="text-sm font-black text-slate-950 dark:text-white">Exercício sugerido</h3>
                <p class="mt-2 leading-7 text-slate-700 dark:text-slate-200">{{ topic.exercise }}</p>
              </section>
            </div>

            <div class="space-y-4">
              <select class="input" :value="status" @change="$emit('status', ($event.target as HTMLSelectElement).value as TopicStatus)">
                <option value="not-started">Não iniciado</option>
                <option value="studying">Estudando</option>
                <option value="completed">Concluído</option>
              </select>
              <SubtopicChecklist :subtopics="topic.subtopics" :completed="completedSubtopics" @toggle="$emit('toggleSubtopic', $event)" />
              <label class="block">
                <span class="mb-2 block text-sm font-black text-slate-900 dark:text-white">Anotações pessoais</span>
                <textarea class="input min-h-36 resize-y" :value="notes" placeholder="Ideias, dúvidas, links, exercícios feitos..." @input="$emit('notes', ($event.target as HTMLTextAreaElement).value)" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
