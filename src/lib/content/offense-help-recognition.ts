import type { ScenarioSpec } from "@/lib/scenario/types";

/**
 * A roller gets a live dribble at the rim, the low man tags him off the
 * weak-side corner. Freeze the instant the tag commits — the only defender
 * back home for a full pass cycle has now rotated away from his man.
 */
export const helpRecognitionSkip: ScenarioSpec = {
  id: "help-recognition-skip",
  title: "Help Defense Recognition — Weak-Side Skip",
  category: "offense-help-recognition",
  side: "offense",
  difficulty: 6,
  durationMs: 4000,
  entities: [
    {
      id: "ball",
      kind: "ball",
      keyframes: [
        { t: 0, x: 55, y: 20, action: "dribble" },
        { t: 1200, x: 45, y: 34, action: "pass" },
        { t: 1700, x: 34, y: 46, action: "catch" },
      ],
    },
    {
      id: "roller",
      kind: "teammate",
      label: "Roller (drew the tag)",
      number: 41,
      keyframes: [
        { t: 0, x: 38, y: 30 },
        { t: 1700, x: 32, y: 60, action: "post-up" },
      ],
    },
    {
      id: "lowMan",
      kind: "defender",
      label: "Low Man (tagging the roller)",
      keyframes: [
        { t: 0, x: 10, y: 58 },
        { t: 1700, x: 28, y: 66, action: "rotate" },
        { t: 2600, x: 30, y: 66 },
      ],
    },
    {
      id: "weakCornerShooter",
      kind: "teammate",
      label: "Weak-Side Corner (low man's man)",
      number: 2,
      keyframes: [{ t: 0, x: 8, y: 55 }],
    },
    {
      id: "onBallDefender",
      kind: "defender",
      label: "Your Defender",
      keyframes: [
        { t: 0, x: 58, y: 18 },
        { t: 1700, x: 40, y: 42 },
      ],
    },
    {
      id: "hoop",
      kind: "hoop",
      keyframes: [{ t: 0, x: 50, y: 98 }],
    },
  ],
  camera: [
    { t: 0, panX: 0.1 },
    { t: 1700, panX: -0.3 },
    { t: 2600, panX: -0.45 },
  ],
  decisionPoint: {
    t: 2600,
    prompt: "WHAT'S YOUR READ?",
    rationale:
      "The low man fully left the corner to tag the roller and hasn't recovered — that corner is wide open and the skip pass across the floor beats his closeout every time if you throw it now.",
    options: [
      { id: "skip-corner", label: "Skip to the weak-side corner", isCorrect: true },
      {
        id: "dump-roller",
        label: "Dump it back to the roller",
        isCorrect: false,
        feedback:
          "The roller is now covered by two defenders in the paint — that's exactly why the corner is open, don't force it back in.",
        errorType: "Passed into the tag instead of away from it",
      },
      {
        id: "attack-tagger",
        label: "Attack the tagger one-on-one",
        isCorrect: false,
        feedback:
          "You'd be putting the ball on the floor against a set defender with your own man still trailing — the extra pass is open and safer.",
        errorType: "Chose to attack instead of reading the extra pass",
      },
      {
        id: "reset-pass",
        label: "Pass back out top",
        isCorrect: false,
        feedback:
          "Resetting gives the low man time to recover to his man — the window is open right now, not after a reset.",
        errorType: "Missed the live window created by the tag",
      },
    ],
  },
  outcomes: [
    {
      optionId: "skip-corner",
      resultLabel: "Corner shooter buries the open three",
      outcomeDurationMs: 1400,
      continuation: {
        ball: [
          { t: 0, x: 34, y: 46, action: "pass" },
          { t: 600, x: 8, y: 55, action: "shoot" },
        ],
        lowMan: [
          { t: 0, x: 30, y: 66 },
          { t: 600, x: 15, y: 58, action: "closeout" },
        ],
      },
    },
    {
      optionId: "dump-roller",
      resultLabel: "Roller stripped in traffic",
      outcomeDurationMs: 1300,
      continuation: {
        ball: [
          { t: 0, x: 34, y: 46, action: "pass" },
          { t: 500, x: 32, y: 60 },
        ],
        lowMan: [
          { t: 0, x: 30, y: 66 },
          { t: 500, x: 31, y: 62 },
        ],
      },
    },
    {
      optionId: "attack-tagger",
      resultLabel: "Contested, offensive foul",
      outcomeDurationMs: 1300,
      continuation: {
        ball: [
          { t: 0, x: 34, y: 46, action: "dribble" },
          { t: 700, x: 30, y: 56 },
        ],
      },
    },
    {
      optionId: "reset-pass",
      resultLabel: "Low man recovers home",
      outcomeDurationMs: 1200,
      continuation: {
        ball: [
          { t: 0, x: 34, y: 46, action: "pass" },
          { t: 700, x: 50, y: 22 },
        ],
        lowMan: [
          { t: 0, x: 30, y: 66 },
          { t: 700, x: 12, y: 56 },
        ],
      },
    },
  ],
  tags: ["help-defense", "skip-pass", "low-man"],
};
