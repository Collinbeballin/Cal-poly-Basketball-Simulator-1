import type { ScenarioSpec } from "@/lib/scenario/types";

/**
 * You have the ball on the wing with a post player working for position.
 * His defender fronts him completely, and the weak-side helper has cheated
 * down to take away the lob. Freeze as the front locks in.
 */
export const postEntryFronted: ScenarioSpec = {
  id: "post-entry-fronted",
  title: "Post Entry — Fronted Post",
  category: "offense-post-entry",
  side: "offense",
  difficulty: 6,
  durationMs: 3600,
  entities: [
    {
      id: "ball",
      kind: "ball",
      keyframes: [{ t: 0, x: 78, y: 30, action: "dribble" }],
    },
    {
      id: "postPlayer",
      kind: "teammate",
      label: "Post Player",
      number: 55,
      keyframes: [{ t: 0, x: 40, y: 78, action: "post-up" }],
    },
    {
      id: "postDefender",
      kind: "defender",
      label: "Fronting Post Defender",
      keyframes: [{ t: 0, x: 40, y: 72 }],
    },
    {
      id: "weakSideHelper",
      kind: "defender",
      label: "Weak-Side Helper (cheating down for the lob)",
      keyframes: [
        { t: 0, x: 25, y: 55 },
        { t: 1600, x: 32, y: 65, action: "rotate" },
      ],
    },
    {
      id: "weakWing",
      kind: "teammate",
      label: "Weak-Side Wing",
      number: 15,
      keyframes: [{ t: 0, x: 18, y: 35 }],
    },
    {
      id: "hoop",
      kind: "hoop",
      keyframes: [{ t: 0, x: 50, y: 98 }],
    },
  ],
  camera: [
    { t: 0, panX: -0.2 },
    { t: 1600, panX: -0.3 },
  ],
  decisionPoint: {
    t: 1600,
    prompt: "WHAT'S YOUR READ?",
    rationale:
      "He's fully fronted and the weak-side helper has already cheated down to take away the lob — both direct entries are covered. Reversing the ball forces the front defender to work to recover position, or opens a mismatch on the catch.",
    options: [
      { id: "reverse-ball", label: "Reverse the ball", isCorrect: true },
      {
        id: "direct-entry",
        label: "Entry pass anyway",
        isCorrect: false,
        feedback:
          "Throwing it into a full front with a helper camped in the passing lane is a turnover waiting to happen.",
        errorType: "Forced a pass into a denied passing lane",
      },
      {
        id: "lob-pass",
        label: "Lob over the front",
        isCorrect: false,
        feedback:
          "The weak-side helper has already cheated down specifically to take that away — he's sitting right in the lob's path.",
        errorType: "Threw into the exact help defender was positioned for",
      },
      {
        id: "drive-dish",
        label: "Drive and dish",
        isCorrect: false,
        feedback:
          "Driving into a loaded post area collapses the defense further into the numbers advantage you're trying to create — reverse it first.",
        errorType: "Attacked before working the advantage the front creates",
      },
    ],
  },
  outcomes: [
    {
      optionId: "reverse-ball",
      resultLabel: "Ball reversed — post seals for an easy entry",
      outcomeDurationMs: 1500,
      continuation: {
        ball: [
          { t: 0, x: 78, y: 30, action: "pass" },
          { t: 500, x: 18, y: 35, action: "catch" },
          { t: 900, x: 32, y: 68, action: "pass" },
        ],
        postDefender: [
          { t: 0, x: 40, y: 72 },
          { t: 900, x: 36, y: 74 },
        ],
        postPlayer: [
          { t: 0, x: 40, y: 78, action: "post-up" },
          { t: 900, x: 36, y: 80, action: "catch" },
        ],
      },
    },
    {
      optionId: "direct-entry",
      resultLabel: "Deflected — live-ball turnover",
      outcomeDurationMs: 1300,
      continuation: {
        ball: [
          { t: 0, x: 78, y: 30, action: "pass" },
          { t: 600, x: 40, y: 74 },
        ],
        postDefender: [
          { t: 0, x: 40, y: 72 },
          { t: 600, x: 40, y: 73 },
        ],
      },
    },
    {
      optionId: "lob-pass",
      resultLabel: "Helper picks off the lob",
      outcomeDurationMs: 1300,
      continuation: {
        ball: [
          { t: 0, x: 78, y: 30, action: "pass" },
          { t: 600, x: 33, y: 66 },
        ],
        weakSideHelper: [
          { t: 0, x: 32, y: 65 },
          { t: 600, x: 33, y: 64 },
        ],
      },
    },
    {
      optionId: "drive-dish",
      resultLabel: "Collapsed defense forces a bad pass",
      outcomeDurationMs: 1300,
      continuation: {
        ball: [
          { t: 0, x: 78, y: 30, action: "dribble" },
          { t: 700, x: 55, y: 50 },
        ],
      },
    },
  ],
  tags: ["post-entry", "front"],
};
