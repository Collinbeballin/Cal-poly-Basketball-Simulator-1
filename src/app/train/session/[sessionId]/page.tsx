"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SceneRenderer } from "@/components/trainer/SceneRenderer";
import { DecisionPrompt } from "@/components/trainer/DecisionPrompt";
import { RevealPanel } from "@/components/trainer/RevealPanel";
import { SessionSummary } from "@/components/trainer/SessionSummary";
import { useScenarioPlayback } from "@/components/trainer/useScenarioPlayback";
import { selectNextScenario } from "@/lib/difficulty/selectNextScenario";
import { useSimulatorStore } from "@/lib/data/store";
import { getRepository } from "@/lib/data/repository";
import { DEMO_PLAYER_ID } from "@/lib/data/constants";
import type { DecisionResult } from "@/lib/scenario/player";
import type { ScenarioCategory, ScenarioSpec } from "@/lib/scenario/types";

function SessionInner() {
  const searchParams = useSearchParams();
  const focusCategory =
    (searchParams.get("category") as ScenarioCategory | null) ?? undefined;

  const store = useSimulatorStore();
  const [scenario, setScenario] = useState<ScenarioSpec>(() =>
    selectNextScenario(store.categoryStats, [], focusCategory)
  );
  const [sessionResults, setSessionResults] = useState<DecisionResult[]>([]);
  const [ended, setEnded] = useState(false);

  const { speedMultiplier, decisionWindowMs } = store.getDifficultyParams(
    scenario.category
  );

  const { snapshot, selectOption, continueToOutcome } = useScenarioPlayback(
    scenario,
    {
      speedMultiplier,
      decisionWindowMs,
      onDecision: (result) => {
        store.recordDecision(result.category, result.correct, result.reactionMs);

        const correctOption = scenario.decisionPoint.options.find(
          (o) => o.id === result.correctOptionId
        )!;
        const chosenOption = scenario.decisionPoint.options.find(
          (o) => o.id === result.chosenOptionId
        );

        getRepository().saveRep({
          id: `${DEMO_PLAYER_ID}-${scenario.id}-${Date.now()}`,
          playerId: DEMO_PLAYER_ID,
          scenarioId: scenario.id,
          scenarioTitle: scenario.title,
          category: scenario.category,
          chosenOptionId: result.chosenOptionId,
          chosenOptionLabel: chosenOption?.label ?? "No answer (timed out)",
          correctOptionId: result.correctOptionId,
          correctOptionLabel: correctOption.label,
          correct: result.correct,
          timedOut: result.timedOut,
          reactionMs: result.reactionMs,
          difficultyAtRep: scenario.difficulty,
          errorType: result.correct ? undefined : chosenOption?.errorType,
          timestamp: new Date().toISOString(),
        });

        setSessionResults((prev) => [...prev, result]);
      },
      onDone: () => {
        const next = selectNextScenario(
          store.categoryStats,
          [scenario.id, ...store.recentScenarioIds],
          focusCategory
        );
        store.pushRecentScenario(scenario.id);
        setScenario(next);
      },
    }
  );

  if (ended) {
    return (
      <SessionSummary
        repsCompleted={sessionResults.length}
        correctCount={sessionResults.filter((r) => r.correct).length}
        avgReactionMs={
          sessionResults.length > 0
            ? sessionResults.reduce((a, r) => a + r.reactionMs, 0) /
              sessionResults.length
            : 0
        }
        onTrainAgain={() => {
          setSessionResults([]);
          setEnded(false);
          setScenario(
            selectNextScenario(store.categoryStats, [], focusCategory)
          );
        }}
      />
    );
  }

  const phase = snapshot?.phase ?? "idle";
  const showChrome = phase === "playing" || phase === "idle";

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-ink-950">
      <SceneRenderer scenario={scenario} snapshot={snapshot} />

      {/* Minimal top HUD — nearly invisible during live playback, gone
          entirely at the decision moment. */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-6 py-5 transition-opacity duration-300 ${
          showChrome ? "opacity-70" : "opacity-0"
        }`}
      >
        <span className="text-xs uppercase tracking-[0.3em] text-white/60">
          Rep {sessionResults.length + 1}
        </span>
        <button
          onClick={() => setEnded(true)}
          className="pointer-events-auto rounded-full border border-white/20 px-4 py-1.5 text-xs text-white/60 hover:border-white/40 hover:text-white"
        >
          End Session
        </button>
      </div>

      {phase === "frozen" && snapshot && (
        <DecisionPrompt
          prompt={scenario.decisionPoint.prompt}
          options={scenario.decisionPoint.options}
          onSelect={selectOption}
          countdownRemainingMs={snapshot.countdownRemainingMs}
          decisionWindowMs={decisionWindowMs}
        />
      )}

      {phase === "revealed" && snapshot && (
        <RevealPanel
          chosenOption={snapshot.chosenOption}
          correctOption={snapshot.correctOption}
          reactionMs={snapshot.reactionMs}
          rationale={scenario.decisionPoint.rationale}
          timedOut={snapshot.timedOut}
          onContinue={continueToOutcome}
        />
      )}
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={null}>
      <SessionInner />
    </Suspense>
  );
}
