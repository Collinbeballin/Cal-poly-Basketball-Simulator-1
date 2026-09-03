"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OFFENSE_CATEGORIES, type ScenarioCategory } from "@/lib/scenario/types";
import { categoryLabel } from "@/lib/content/labels";
import { PageHeader } from "@/components/ui/PageHeader";

function TrainSetup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetCategory = searchParams.get("category") as ScenarioCategory | null;

  const [category, setCategory] = useState<ScenarioCategory | "adaptive">(
    presetCategory ?? "adaptive"
  );

  const startSession = () => {
    const sessionId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
    const query = category === "adaptive" ? "" : `?category=${category}`;
    router.push(`/train/session/${sessionId}${query}`);
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <PageHeader eyebrow="Training" title="Start a Session" />

      <p className="mb-8 max-w-xl text-white/50">
        Pick a focus area, or let the simulator adapt automatically and target
        your weakest reads. Difficulty adjusts as you train.
      </p>

      <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          onClick={() => setCategory("adaptive")}
          className={`rounded-xl border px-5 py-4 text-left transition ${
            category === "adaptive"
              ? "border-accent bg-accent/10 text-accent-bright"
              : "border-ink-700 bg-ink-900/60 text-white/70 hover:border-ink-500"
          }`}
        >
          <div className="font-medium">Adaptive Mix</div>
          <div className="text-xs text-white/40">
            Weighted toward your weakest categories
          </div>
        </button>

        {OFFENSE_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-xl border px-5 py-4 text-left transition ${
              category === c
                ? "border-accent bg-accent/10 text-accent-bright"
                : "border-ink-700 bg-ink-900/60 text-white/70 hover:border-ink-500"
            }`}
          >
            <div className="font-medium">{categoryLabel(c)}</div>
          </button>
        ))}
      </div>

      <button
        onClick={startSession}
        className="rounded-full bg-accent px-10 py-4 text-sm font-semibold text-ink-950 transition hover:bg-accent-bright"
      >
        Enter the Possession
      </button>
    </main>
  );
}

export default function TrainPage() {
  return (
    <Suspense fallback={null}>
      <TrainSetup />
    </Suspense>
  );
}
