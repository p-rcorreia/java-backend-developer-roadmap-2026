<script setup lang="ts">
defineProps<{ subtopics: string[]; completed: string[]; compact?: boolean }>();
defineEmits<{ toggle: [subtopic: string] }>();
</script>

<template>
  <div class="grid gap-2" :class="compact ? 'sm:grid-cols-2' : ''">
    <label
      v-for="subtopic in subtopics"
      :key="subtopic"
      class="flex cursor-pointer items-start gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
    >
      <input class="mt-1 h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-400" type="checkbox" :checked="completed.includes(subtopic)" @change="$emit('toggle', subtopic)" />
      <span class="text-slate-700 dark:text-slate-200" :class="{ 'line-through opacity-60': completed.includes(subtopic) }">{{ subtopic }}</span>
    </label>
  </div>
</template>
