import type { ScenarioSpec } from "@/lib/scenario/types";

/**
 * Ball-handler brings it up, the screener sets a ball screen at the top of
 * the key. The on-ball defender fights over, the screener's defender drops,
 * leaving a live pocket for the roller while the corner shooter's defender
 * stays home. Freeze right as the roller separates.
 */
export const pickAndRollDrop: ScenarioSpec = {
  id: "pnr-drop-pocket",
  title: "Pick & Roll — Drop Coverage",
  category: "offense-pnr",
  side: "offense",
  difficulty: 3,
  durationMs: 4400,
  entities: [
    {
      id: "ball",
      kind: "ball",
      keyframes: [
        { t: 0, x: 52, y: 6, action: "dribble" },
        { t: 1200, x: 47, y: 10, action: "dribble" },
        { t: 2400, x: 40, y: 16, action: "dribble" },
        { t: 3200, x: 36, y: 18, action: "dribble" },
      ],
    },
    {
      id: "screener",
      kind: "screener",
      label: "Screener (4)",
      number: 34,
      keyframes: [
        { t: 0, x: 30, y: 22, opacity: 1 },
        { t: 1600, x: 38, y: 17, action: "screen" },
        { t: 2600, x: 38, y: 17, action: "screen" },
        { t: 3200, x: 46, y: 32, action: "cut" },
      ],
    },
    {
      id: "onBallDefender",
      kind: "defender",
      label: "On-Ball X1",
      keyframes: [
        { t: 0, x: 55, y: 10 },
        { t: 1400, x: 50, y: 12 },
        { t: 2400, x: 34, y: 14, action: "rotate" },
        { t: 3200, x: 32, y: 16 },
      ],
    },
    {
      id: "bigDefender",
      kind: "defender",
      label: "Screener's X4 (dropping)",
      keyframes: [
        { t: 0, x: 32, y: 24 },
        { t: 1600, x: 34, y: 26 },
        { t: 3200, x: 38, y: 40, action: "rotate" },
      ],
    },
    {
      id: "cornerShooter",
      kind: "teammate",
      label: "Corner Shooter",
      number: 11,
      keyframes: [{ t: 0, x: 92, y: 55 }],
    },
    {
      id: "weakSideDefender",
      kind: "defender",
      label: "Weak-Side X",
      keyframes: [{ t: 0, x: 85, y: 48 }],
    },
    {
      id: "hoop",
      kind: "hoop",
      keyframes: [{ t: 0, x: 50, y: 98 }],
    },
  ],
  camera: [
    { t: 0, panX: 0 },
    { t: 1600, panX: -0.15 },
    { t: 3200, panX: -0.3 },
  ],
  decisionPoint: {
    t: 3200,
    prompt: "WHAT'S YOUR READ?",
    rationale:
      "The screener's defender dropped well below the level of the screen, and the roller separated behind him with a clean driving/passing lane — the pocket pass is live before the low man can tag it.",
    options: [
      {
        id: "pocket-pass",
        label: "Pocket pass",
        isCorrect: true,
      },
      {
        id: "attack-drop",
        label: "Attack the drop",
        isCorrect: false,
        feedback:
          "The drop defender has two feet in the paint and a clean angle on you — you're driving into a wall, not an advantage.",
        errorType: "Attacked a set defender instead of the open roller",
      },
      {
        id: "pull-up",
        label: "Pull-up",
        isCorrect: false,
        feedback:
          "You're only a step off the screen with your defender trailing — the roller is a much higher-value look than a contested pull-up.",
        errorType: "Settled for a jumper with a better option available",
      },
      {
        id: "skip-pass",
        label: "Skip pass",
        isCorrect: false,
        feedback:
          "The weak-side defender is at home and has time to close — the skip isn't there yet, and you're skipping past an open teammate.",
        errorType: "Missed the closer, higher-value option",
      },
      {
        id: "reject-screen",
        label: "Reject screen",
        isCorrect: false,
        feedback:
          "Your defender already committed over the top of the screen — rejecting it just runs you back into him.",
        errorType: "Misread which way the defender was going",
      },
    ],
  },
  outcomes: [
    {
      optionId: "pocket-pass",
      resultLabel: "Roller finishes at the rim",
      outcomeDurationMs: 1500,
      continuation: {
        ball: [
          { t: 0, x: 36, y: 18, action: "pass" },
          { t: 400, x: 44, y: 30 },
          { t: 700, x: 46, y: 33, action: "shoot" },
        ],
        screener: [
          { t: 0, x: 46, y: 32, action: "cut" },
          { t: 700, x: 48, y: 40, action: "shoot" },
        ],
        bigDefender: [
          { t: 0, x: 38, y: 40 },
          { t: 700, x: 44, y: 42 },
        ],
      },
    },
    {
      optionId: "attack-drop",
      resultLabel: "Charge called at the rim",
      outcomeDurationMs: 1500,
      continuation: {
        ball: [
          { t: 0, x: 36, y: 18, action: "dribble" },
          { t: 800, x: 38, y: 34, action: "dribble" },
        ],
        bigDefender: [
          { t: 0, x: 38, y: 40 },
          { t: 800, x: 38, y: 36 },
        ],
      },
    },
    {
      optionId: "pull-up",
      resultLabel: "Contested mid-range miss",
      outcomeDurationMs: 1300,
      continuation: {
        ball: [
          { t: 0, x: 36, y: 18, action: "shoot" },
          { t: 500, x: 36, y: 20 },
        ],
      },
    },
    {
      optionId: "skip-pass",
      resultLabel: "Weak-side defender closes it out — turnover",
      outcomeDurationMs: 1400,
      continuation: {
        ball: [
          { t: 0, x: 36, y: 18, action: "pass" },
          { t: 700, x: 88, y: 52 },
        ],
        weakSideDefender: [
          { t: 0, x: 85, y: 48 },
          { t: 700, x: 88, y: 50, action: "closeout" },
        ],
      },
    },
    {
      optionId: "reject-screen",
      resultLabel: "Trailing defender recovers — forced pass",
      outcomeDurationMs: 1300,
      continuation: {
        ball: [
          { t: 0, x: 36, y: 18, action: "dribble" },
          { t: 600, x: 28, y: 18 },
        ],
        onBallDefender: [
          { t: 0, x: 32, y: 16 },
          { t: 600, x: 30, y: 16 },
        ],
      },
    },
  ],
  tags: ["pick-and-roll", "drop-coverage", "example"],
};
