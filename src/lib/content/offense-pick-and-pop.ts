import type { ScenarioSpec } from "@/lib/scenario/types";

/**
 * Same action, different coverage: the screener's defender jumps out hard
 * to hedge/show on the ball, so the screener pops to the three-point line
 * instead of rolling. Freeze as the popper squares up, wide open.
 */
export const pickAndPopRead: ScenarioSpec = {
  id: "pnp-read-pop",
  title: "Pick & Pop — Hard Hedge",
  category: "offense-pnp",
  side: "offense",
  difficulty: 4,
  durationMs: 4200,
  entities: [
    {
      id: "ball",
      kind: "ball",
      keyframes: [
        { t: 0, x: 50, y: 6, action: "dribble" },
        { t: 1200, x: 44, y: 10, action: "dribble" },
        { t: 2200, x: 34, y: 15, action: "dribble" },
        { t: 3000, x: 30, y: 16, action: "dribble" },
      ],
    },
    {
      id: "screener",
      kind: "screener",
      label: "Screener (5)",
      number: 44,
      keyframes: [
        { t: 0, x: 26, y: 20 },
        { t: 1500, x: 34, y: 16, action: "screen" },
        { t: 2400, x: 34, y: 16, action: "screen" },
        { t: 3000, x: 20, y: 24, action: "cut" },
      ],
    },
    {
      id: "onBallDefender",
      kind: "defender",
      label: "On-Ball X1",
      keyframes: [
        { t: 0, x: 53, y: 10 },
        { t: 1400, x: 46, y: 12 },
        { t: 2200, x: 33, y: 13 },
        { t: 3000, x: 31, y: 15 },
      ],
    },
    {
      id: "bigDefender",
      kind: "defender",
      label: "Screener's X5 (hedging)",
      keyframes: [
        { t: 0, x: 30, y: 22 },
        { t: 2200, x: 30, y: 14, action: "closeout" },
        { t: 3000, x: 30, y: 13 },
      ],
    },
    {
      id: "cornerShooter",
      kind: "teammate",
      label: "Corner Shooter",
      number: 5,
      keyframes: [{ t: 0, x: 90, y: 58 }],
    },
    {
      id: "weakSideDefender",
      kind: "defender",
      label: "Weak-Side X",
      keyframes: [{ t: 0, x: 84, y: 50 }],
    },
    {
      id: "hoop",
      kind: "hoop",
      keyframes: [{ t: 0, x: 50, y: 98 }],
    },
  ],
  camera: [
    { t: 0, panX: 0 },
    { t: 1500, panX: -0.2 },
    { t: 3000, panX: -0.35 },
  ],
  decisionPoint: {
    t: 3000,
    prompt: "WHAT'S YOUR READ?",
    rationale:
      "The screener's defender fully hedged out to stop the ball, leaving the popper completely alone above the break — the pass to the pop is the highest-value read before the hedge defender can recover.",
    options: [
      { id: "pass-to-pop", label: "Pass to the pop", isCorrect: true },
      {
        id: "attack-gap",
        label: "Attack the gap",
        isCorrect: false,
        feedback:
          "The hedge defender is squared up in front of you with your own defender trailing — there's no driving lane, just two defenders.",
        errorType: "Drove into a load-up instead of finding the popper",
      },
      {
        id: "pull-up",
        label: "Pull-up",
        isCorrect: false,
        feedback:
          "You're staring down two defenders at the level of the screen — that's a low-percentage shot with a wide-open teammate on the floor.",
        errorType: "Forced a shot with a better option available",
      },
      {
        id: "skip-pass",
        label: "Skip pass",
        isCorrect: false,
        feedback:
          "The skip goes past your own open teammate — the popper is a full pass closer and completely unguarded.",
        errorType: "Missed the closer, higher-value option",
      },
    ],
  },
  outcomes: [
    {
      optionId: "pass-to-pop",
      resultLabel: "Popper buries the open three",
      outcomeDurationMs: 1400,
      continuation: {
        ball: [
          { t: 0, x: 30, y: 16, action: "pass" },
          { t: 500, x: 20, y: 24, action: "shoot" },
        ],
        screener: [
          { t: 0, x: 20, y: 24, action: "shoot" },
          { t: 500, x: 20, y: 24 },
        ],
      },
    },
    {
      optionId: "attack-gap",
      resultLabel: "Trapped and stripped",
      outcomeDurationMs: 1300,
      continuation: {
        ball: [
          { t: 0, x: 30, y: 16, action: "dribble" },
          { t: 700, x: 28, y: 18 },
        ],
      },
    },
    {
      optionId: "pull-up",
      resultLabel: "Contested, off the back rim",
      outcomeDurationMs: 1200,
      continuation: {
        ball: [
          { t: 0, x: 30, y: 16, action: "shoot" },
          { t: 500, x: 30, y: 18 },
        ],
      },
    },
    {
      optionId: "skip-pass",
      resultLabel: "Weak-side X recovers in time — pass deflected",
      outcomeDurationMs: 1400,
      continuation: {
        ball: [
          { t: 0, x: 30, y: 16, action: "pass" },
          { t: 700, x: 86, y: 55 },
        ],
        weakSideDefender: [
          { t: 0, x: 84, y: 50 },
          { t: 700, x: 87, y: 53, action: "closeout" },
        ],
      },
    },
  ],
  tags: ["pick-and-pop", "hedge"],
};
