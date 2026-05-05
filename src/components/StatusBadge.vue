<script setup lang="ts">
import type { TopicStatus } from "@/types/roadmap";
import { statusMeta } from "@/utils/roadmapUi";

defineProps<{ status: TopicStatus }>();
</script>

<template>
  <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1" :class="statusMeta[status].className">
    <component :is="statusMeta[status].icon" class="h-3.5 w-3.5" />
    {{ statusMeta[status].label }}
  </span>
</template>
