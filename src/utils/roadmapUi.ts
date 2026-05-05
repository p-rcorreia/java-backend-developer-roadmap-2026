import {
  BookOpen,
  CheckCircle2,
  Circle,
  CircleDot,
  CloudCog,
  Coffee,
  Compass,
  Database,
  Leaf,
  Network,
  ServerCog,
  ShieldCheck,
  TestTube2,
  Workflow,
  type LucideIcon,
} from "lucide-vue-next";
import type { TopicStatus } from "@/types/roadmap";

export const iconMap: Record<string, LucideIcon> = {
  Coffee,
  Workflow,
  Database,
  Leaf,
  ServerCog,
  TestTube2,
  Network,
  ShieldCheck,
  CloudCog,
  Compass,
  BookOpen,
};

export const colorClasses: Record<string, { soft: string; text: string; bg: string; border: string; ring: string }> = {
  blue: { soft: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-700 dark:text-blue-300", bg: "bg-blue-500", border: "border-blue-200 dark:border-blue-900", ring: "ring-blue-100 dark:ring-blue-950" },
  violet: { soft: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-700 dark:text-violet-300", bg: "bg-violet-500", border: "border-violet-200 dark:border-violet-900", ring: "ring-violet-100 dark:ring-violet-950" },
  emerald: { soft: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-500", border: "border-emerald-200 dark:border-emerald-900", ring: "ring-emerald-100 dark:ring-emerald-950" },
  lime: { soft: "bg-lime-50 dark:bg-lime-950/40", text: "text-lime-700 dark:text-lime-300", bg: "bg-lime-500", border: "border-lime-200 dark:border-lime-900", ring: "ring-lime-100 dark:ring-lime-950" },
  orange: { soft: "bg-orange-50 dark:bg-orange-950/40", text: "text-orange-700 dark:text-orange-300", bg: "bg-orange-500", border: "border-orange-200 dark:border-orange-900", ring: "ring-orange-100 dark:ring-orange-950" },
  rose: { soft: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-700 dark:text-rose-300", bg: "bg-rose-500", border: "border-rose-200 dark:border-rose-900", ring: "ring-rose-100 dark:ring-rose-950" },
  cyan: { soft: "bg-cyan-50 dark:bg-cyan-950/40", text: "text-cyan-700 dark:text-cyan-300", bg: "bg-cyan-500", border: "border-cyan-200 dark:border-cyan-900", ring: "ring-cyan-100 dark:ring-cyan-950" },
  red: { soft: "bg-red-50 dark:bg-red-950/40", text: "text-red-700 dark:text-red-300", bg: "bg-red-500", border: "border-red-200 dark:border-red-900", ring: "ring-red-100 dark:ring-red-950" },
  sky: { soft: "bg-sky-50 dark:bg-sky-950/40", text: "text-sky-700 dark:text-sky-300", bg: "bg-sky-500", border: "border-sky-200 dark:border-sky-900", ring: "ring-sky-100 dark:ring-sky-950" },
  amber: { soft: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-300", bg: "bg-amber-500", border: "border-amber-200 dark:border-amber-900", ring: "ring-amber-100 dark:ring-amber-950" },
};

export const statusMeta: Record<TopicStatus, { label: string; icon: LucideIcon; className: string }> = {
  "not-started": {
    label: "Não iniciado",
    icon: Circle,
    className: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
  },
  studying: {
    label: "Estudando",
    icon: CircleDot,
    className: "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:ring-amber-900",
  },
  completed: {
    label: "Concluído",
    icon: CheckCircle2,
    className: "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-900",
  },
};

export const percent = (completed: number, total: number) => (total === 0 ? 0 : Math.round((completed / total) * 100));
