<script setup lang="ts">
defineProps<{ value: number; colorClass?: string; height?: string }>();
</script>

<template>
  <div class="w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800" :class="height ?? 'h-2.5'">
    <div class="h-full rounded-full transition-all duration-500" :class="colorClass ?? 'bg-slate-900 dark:bg-white'" :style="{ width: `${value}%` }" />
  </div>
</template>
