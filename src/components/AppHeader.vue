<script setup lang="ts">
import { Download, Moon, RotateCcw, Sun, Upload } from "lucide-vue-next";

defineProps<{ darkMode: boolean }>();
defineEmits<{
  toggleTheme: [];
  export: [];
  import: [file: File];
  reset: [];
}>();
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
    <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Roadmap pessoal</p>
        <h1 class="mt-1 text-xl font-black text-slate-950 dark:text-white sm:text-2xl">Java Backend Developer Roadmap 2026</h1>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Minha trilha prática para evoluir como desenvolvedor backend Java</p>
      </div>

      <div class="flex items-center gap-2">
        <button class="icon-button" title="Alternar tema" @click="$emit('toggleTheme')">
          <Sun v-if="darkMode" class="h-4 w-4" />
          <Moon v-else class="h-4 w-4" />
        </button>
        <button class="icon-button" title="Exportar progresso" @click="$emit('export')">
          <Download class="h-4 w-4" />
        </button>
        <label class="icon-button cursor-pointer" title="Importar progresso">
          <Upload class="h-4 w-4" />
          <input
            class="hidden"
            type="file"
            accept="application/json"
            @change="
              (event) => {
                const file = (event.target as HTMLInputElement).files?.[0];
                if (file) $emit('import', file);
                (event.target as HTMLInputElement).value = '';
              }
            "
          />
        </label>
        <button class="icon-button" title="Resetar progresso" @click="$emit('reset')">
          <RotateCcw class="h-4 w-4" />
        </button>
      </div>
    </div>
  </header>
</template>
