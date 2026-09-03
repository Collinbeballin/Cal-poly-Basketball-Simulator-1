import type { ScenarioSpec } from "@/lib/scenario/types";

/**
 * Live-ball rebound, you push it up the floor 2-on-1. One trailing
 * defender has to choose between you and your wing runner. Freeze the
 * instant he commits to the ball.
 */
export const transitionTwoOnOne: ScenarioSpec = {
  id: "transition-2v1",
  title: "Transition — 2-on-1 Numbers",
  category: "offense-transition",
  side: "offense",
  difficulty: 3,
  durationMs: 3600,
  entities: [
    {
      id: "ball",
      kind: "ball",
      keyframes: [
        { t: 0, x: 50, y: 85, action: "dribble" },
        { t: 900, x: 50, y: 60, action: "dribble" },
        { t: 1800, x: 48, y: 38, action: "dribble" },
        { t: 2400, x: 46, y: 28, action: "dribble" },
      ],
    },
    {
      id: "wingRunner",
      kind: "teammate",
      label: "Wing Runner",
      number: 22,
      keyframes: [
        { t: 0, x: 80, y: 75 },
        { t: 1200, x: 78, y: 45 },
        { t: 2400, x: 76, y: 25 },
      ],
    },
    {
      id: "backDefender",
      kind: "defender",
      label: "Lone Back Defender",
      keyframes: [
        { t: 0, x: 52, y: 20 },
        { t: 1200, x: 50, y: 22 },
        { t: 2400, x: 44, y: 24, action: "rotate" },
      ],
    },
    {
      id: "hoop",
      kind: "hoop",
      keyframes: [{ t: 0, x: 50, y: 98 }],
    },
  ],
  camera: [
    { t: 0, panX: 0 },
    { t: 1200, panX: 0.1 },
    { t: 2400, panX: -0.1 },
  ],
  decisionPoint: {
    t: 2400,
    prompt: "WHAT'S YOUR READ?",
    rationale:
      "The lone back defender committed his weight toward you and the ball — the wing runner is completely uncovered for the easy finish, and that pass has to go now before the defender can slide back over.",
    options: [
      { id: "kick-ahead", label: "Kick ahead to the wing", isCorrect: true },
      {
        id: "push-middle",
        label: "Push middle yourself",
        isCorrect: false,
        feedback:
          "You're driving straight into the one defender who's now shaded toward you — you're giving up the numbers advantage instead of using it.",
        errorType: "Ignored the open teammate on a numbers advantage",
      },
      {
        id: "pull-up-early",
        label: "Pull up for an early three",
        isCorrect: false,
        feedback:
          "Settling for a three in transition gives up a layup you already have — this is a shot-selection error, not a decision error.",
        errorType: "Settled for a lower-value shot in transition",
      },
      {
        id: "hold-slow",
        label: "Slow down and set up half-court",
        isCorrect: false,
        feedback:
          "Waiting lets the defense get back and erases the advantage you already have — transition reads have to be made now.",
        errorType: "Failed to play advantage speed",
      },
    ],
  },
  outcomes: [
    {
      optionId: "kick-ahead",
      resultLabel: "Wing finishes in transition",
      outcomeDurationMs: 1300,
      continuation: {
        ball: [
          { t: 0, x: 46, y: 28, action: "pass" },
          { t: 500, x: 74, y: 18, action: "shoot" },
        ],
        wingRunner: [
          { t: 0, x: 76, y: 25 },
          { t: 500, x: 74, y: 18, action: "shoot" },
        ],
      },
    },
    {
      optionId: "push-middle",
      resultLabel: "Contested at the rim, blocked",
      outcomeDurationMs: 1300,
      continuation: {
        ball: [
          { t: 0, x: 46, y: 28, action: "dribble" },
          { t: 700, x: 48, y: 20, action: "shoot" },
        ],
        backDefender: [
          { t: 0, x: 44, y: 24 },
          { t: 700, x: 47, y: 21 },
        ],
      },
    },
    {
      optionId: "pull-up-early",
      resultLabel: "Rushed three, off the rim",
      outcomeDurationMs: 1100,
      continuation: {
        ball: [
          { t: 0, x: 46, y: 28, action: "shoot" },
          { t: 500, x: 46, y: 30 },
        ],
      },
    },
    {
      optionId: "hold-slow",
      resultLabel: "Defense recovers, advantage gone",
      outcomeDurationMs: 1200,
      continuation: {
        ball: [
          { t: 0, x: 46, y: 28, action: "dribble" },
          { t: 800, x: 46, y: 26 },
        ],
        backDefender: [
          { t: 0, x: 44, y: 24 },
          { t: 800, x: 45, y: 22 },
        ],
      },
    },
  ],
  tags: ["transition", "numbers-advantage"],
};
