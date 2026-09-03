import type { ScenarioSpec } from "@/lib/scenario/types";

/**
 * You drive middle off a live dribble. The strong-side corner defender
 * fully collapses to the rim to help, leaving his own man alone in the
 * corner. Freeze as the help commits.
 */
export const driveAndKickTag: ScenarioSpec = {
  id: "drive-kick-tag",
  title: "Drive & Kick — Tagger Collapses",
  category: "offense-drive-kick",
  side: "offense",
  difficulty: 5,
  durationMs: 3800,
  entities: [
    {
      id: "ball",
      kind: "ball",
      keyframes: [
        { t: 0, x: 55, y: 30, action: "dribble" },
        { t: 1000, x: 50, y: 50, action: "dribble" },
        { t: 2000, x: 48, y: 68, action: "dribble" },
      ],
    },
    {
      id: "onBallDefender",
      kind: "defender",
      label: "On-Ball X",
      keyframes: [
        { t: 0, x: 58, y: 26 },
        { t: 1000, x: 52, y: 46 },
        { t: 2000, x: 44, y: 62 },
      ],
    },
    {
      id: "cornerHelper",
      kind: "defender",
      label: "Strong-Side Corner Defender (helping)",
      keyframes: [
        { t: 0, x: 82, y: 62 },
        { t: 2000, x: 60, y: 78, action: "rotate" },
      ],
    },
    {
      id: "strongCornerShooter",
      kind: "teammate",
      label: "Strong-Side Corner",
      number: 24,
      keyframes: [{ t: 0, x: 90, y: 60 }],
    },
    {
      id: "weakCornerShooter",
      kind: "teammate",
      label: "Weak-Side Corner",
      number: 12,
      keyframes: [{ t: 0, x: 12, y: 58 }],
    },
    {
      id: "weakSideDefender",
      kind: "defender",
      label: "Weak-Side X",
      keyframes: [{ t: 0, x: 20, y: 52 }],
    },
    {
      id: "hoop",
      kind: "hoop",
      keyframes: [{ t: 0, x: 50, y: 98 }],
    },
  ],
  camera: [
    { t: 0, panX: -0.1 },
    { t: 1000, panX: 0 },
    { t: 2000, panX: 0.15 },
  ],
  decisionPoint: {
    t: 2000,
    prompt: "WHAT'S YOUR READ?",
    rationale:
      "The strong-side corner fully tagged the drive, leaving his own man wide open in the closest, quickest pass on the floor — that's a higher-value read than skipping cross-court past him.",
    options: [
      { id: "kick-strong-corner", label: "Kick to strong-side corner", isCorrect: true },
      {
        id: "finish-contact",
        label: "Finish through contact",
        isCorrect: false,
        feedback:
          "Two defenders are now in the paint with you — that's a low-percentage, contested finish with an easy kick-out available.",
        errorType: "Forced a shot into help instead of finding the open man",
      },
      {
        id: "skip-weak-corner",
        label: "Skip to weak-side corner",
        isCorrect: false,
        feedback:
          "That pass travels past a wide-open teammate to a defender who's still at home and can closeout in time.",
        errorType: "Missed the closer, higher-value option",
      },
      {
        id: "pass-back-top",
        label: "Pass back out top",
        isCorrect: false,
        feedback:
          "Resetting to the top gives the help defender time to recover — the advantage has to be used right now.",
        errorType: "Failed to capitalize on the tag in the moment",
      },
    ],
  },
  outcomes: [
    {
      optionId: "kick-strong-corner",
      resultLabel: "Strong corner buries the open three",
      outcomeDurationMs: 1400,
      continuation: {
        ball: [
          { t: 0, x: 48, y: 68, action: "pass" },
          { t: 500, x: 90, y: 60, action: "shoot" },
        ],
        cornerHelper: [
          { t: 0, x: 60, y: 78 },
          { t: 500, x: 78, y: 68, action: "closeout" },
        ],
      },
    },
    {
      optionId: "finish-contact",
      resultLabel: "Contested, blocked from behind",
      outcomeDurationMs: 1300,
      continuation: {
        ball: [
          { t: 0, x: 48, y: 68, action: "dribble" },
          { t: 700, x: 48, y: 84, action: "shoot" },
        ],
        cornerHelper: [
          { t: 0, x: 60, y: 78 },
          { t: 700, x: 50, y: 82 },
        ],
      },
    },
    {
      optionId: "skip-weak-corner",
      resultLabel: "Weak-side X closes out in time",
      outcomeDurationMs: 1400,
      continuation: {
        ball: [
          { t: 0, x: 48, y: 68, action: "pass" },
          { t: 700, x: 15, y: 56 },
        ],
        weakSideDefender: [
          { t: 0, x: 20, y: 52 },
          { t: 700, x: 16, y: 55, action: "closeout" },
        ],
      },
    },
    {
      optionId: "pass-back-top",
      resultLabel: "Defense fully recovers",
      outcomeDurationMs: 1200,
      continuation: {
        ball: [
          { t: 0, x: 48, y: 68, action: "pass" },
          { t: 700, x: 50, y: 30 },
        ],
      },
    },
  ],
  tags: ["drive-and-kick", "help-recognition"],
};
