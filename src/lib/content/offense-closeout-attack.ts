import type { ScenarioSpec } from "@/lib/scenario/types";

/**
 * You catch a kick-out in the corner. Your defender flies at you off a
 * scramble rotation, out of control, and overruns the catch. Freeze right
 * as he lands — his momentum has carried him toward the sideline.
 */
export const closeoutAttackCorner: ScenarioSpec = {
  id: "closeout-attack-corner",
  title: "Closeout Attack — Corner Catch",
  category: "offense-closeout-attack",
  side: "offense",
  difficulty: 4,
  durationMs: 3400,
  entities: [
    {
      id: "ball",
      kind: "ball",
      keyframes: [
        { t: 0, x: 68, y: 40, action: "pass" },
        { t: 900, x: 90, y: 58, action: "catch" },
      ],
    },
    {
      id: "closingDefender",
      kind: "defender",
      label: "Closing Out X",
      keyframes: [
        { t: 0, x: 70, y: 30 },
        { t: 900, x: 84, y: 50, action: "closeout" },
        { t: 1700, x: 96, y: 56 },
      ],
    },
    {
      id: "wingPasser",
      kind: "teammate",
      label: "Wing (passed from)",
      number: 3,
      keyframes: [{ t: 0, x: 60, y: 35 }],
    },
    {
      id: "helpDefender",
      kind: "defender",
      label: "Weak-Side Help",
      keyframes: [{ t: 0, x: 45, y: 55 }],
    },
    {
      id: "hoop",
      kind: "hoop",
      keyframes: [{ t: 0, x: 50, y: 98 }],
    },
  ],
  camera: [
    { t: 0, panX: 0.4 },
    { t: 900, panX: 0.55 },
    { t: 1700, panX: 0.5 },
  ],
  decisionPoint: {
    t: 1700,
    prompt: "WHAT'S YOUR READ?",
    rationale:
      "The closeout was out of control and flew past you toward the sideline — the three is fully taken away, but he has no chance to recover on a drive back middle into the vacated space.",
    options: [
      { id: "drive-middle", label: "Drive middle", isCorrect: true },
      {
        id: "catch-shoot",
        label: "Catch and shoot",
        isCorrect: false,
        feedback:
          "His hand is right in your eyes and he's still square to you on that side — the three is contested, not open.",
        errorType: "Shot into a closeout instead of attacking it",
      },
      {
        id: "drive-baseline",
        label: "Drive baseline",
        isCorrect: false,
        feedback:
          "Baseline is exactly where his momentum is already carrying him — you'd be driving right into where he's about to be.",
        errorType: "Attacked the closeout's recovery angle, not his blind side",
      },
      {
        id: "reset-pass",
        label: "Pass back out top",
        isCorrect: false,
        feedback:
          "Passing it back gives the defense a free reset when you have a blown closeout to exploit right now.",
        errorType: "Passed up a clear advantage",
      },
    ],
  },
  outcomes: [
    {
      optionId: "drive-middle",
      resultLabel: "Blow-by, finish at the rim",
      outcomeDurationMs: 1400,
      continuation: {
        ball: [
          { t: 0, x: 90, y: 58, action: "dribble" },
          { t: 700, x: 60, y: 80, action: "dribble" },
          { t: 1100, x: 52, y: 92, action: "shoot" },
        ],
        closingDefender: [
          { t: 0, x: 96, y: 56 },
          { t: 700, x: 85, y: 60 },
        ],
      },
    },
    {
      optionId: "catch-shoot",
      resultLabel: "Contested miss",
      outcomeDurationMs: 1200,
      continuation: {
        ball: [
          { t: 0, x: 90, y: 58, action: "shoot" },
          { t: 500, x: 90, y: 60 },
        ],
      },
    },
    {
      optionId: "drive-baseline",
      resultLabel: "Cut off, forced out of bounds",
      outcomeDurationMs: 1200,
      continuation: {
        ball: [
          { t: 0, x: 90, y: 58, action: "dribble" },
          { t: 700, x: 97, y: 66 },
        ],
        closingDefender: [
          { t: 0, x: 96, y: 56 },
          { t: 700, x: 97, y: 62 },
        ],
      },
    },
    {
      optionId: "reset-pass",
      resultLabel: "Defense resets, shot clock burned",
      outcomeDurationMs: 1100,
      continuation: {
        ball: [
          { t: 0, x: 90, y: 58, action: "pass" },
          { t: 600, x: 60, y: 35 },
        ],
      },
    },
  ],
  tags: ["closeout", "scramble"],
};
