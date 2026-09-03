import type { ScenarioSpec } from "@/lib/scenario/types";

/**
 * Shot clock is bleeding out. You're isolated above the arc with your
 * defender playing you straight up and no help in sight. Freeze with the
 * clock at 3 seconds.
 */
export const lateClockDecision: ScenarioSpec = {
  id: "late-clock-decision",
  title: "Late Clock — Isolated at the Top",
  category: "offense-late-clock",
  side: "offense",
  difficulty: 7,
  durationMs: 2600,
  entities: [
    {
      id: "ball",
      kind: "ball",
      keyframes: [
        { t: 0, x: 50, y: 12, action: "dribble" },
        { t: 900, x: 50, y: 14, action: "dribble" },
        { t: 1600, x: 50, y: 14, action: "dribble" },
      ],
    },
    {
      id: "onBallDefender",
      kind: "defender",
      label: "Isolated Defender",
      keyframes: [{ t: 0, x: 52, y: 14 }],
    },
    {
      id: "teammateOne",
      kind: "teammate",
      label: "Teammate (well guarded)",
      number: 8,
      keyframes: [{ t: 0, x: 85, y: 55 }],
    },
    {
      id: "teammateOneDefender",
      kind: "defender",
      label: "Guarding Teammate Tight",
      keyframes: [{ t: 0, x: 82, y: 52 }],
    },
    {
      id: "hoop",
      kind: "hoop",
      keyframes: [{ t: 0, x: 50, y: 98 }],
    },
  ],
  camera: [
    { t: 0, panX: 0 },
    { t: 1600, panX: 0.05 },
  ],
  decisionPoint: {
    t: 1600,
    prompt: "WHAT'S YOUR READ? (Shot clock: 3)",
    rationale:
      "With three seconds left there's no time for another pass to develop, your teammate is tightly guarded anyway, and your defender is playing you honest with no help behind him — attacking off the dribble right now is the only read that gets a clean look before the clock expires.",
    options: [
      { id: "attack-now", label: "Attack off the dribble now", isCorrect: true },
      {
        id: "look-extra-pass",
        label: "Look for the extra pass",
        isCorrect: false,
        feedback:
          "There's no time left for the ball to move again, and your teammate is well covered anyway — that pass either doesn't arrive or doesn't help.",
        errorType: "Passed up a shot the clock didn't allow time to replace",
      },
      {
        id: "call-timeout",
        label: "Call timeout",
        isCorrect: false,
        feedback:
          "There's no timeout to call here and no time to burn — you have a live, isolated advantage to use right now.",
        errorType: "Failed to recognize the situation demanded immediate action",
      },
      {
        id: "force-deep-three",
        label: "Force a contested deep three",
        isCorrect: false,
        feedback:
          "You still have three seconds and a live dribble against straight-up coverage — pulling from deep gives up the higher-value drive read.",
        errorType: "Settled early instead of using the space available",
      },
    ],
  },
  outcomes: [
    {
      optionId: "attack-now",
      resultLabel: "Blow-by, clean look before the buzzer",
      outcomeDurationMs: 1400,
      continuation: {
        ball: [
          { t: 0, x: 50, y: 14, action: "dribble" },
          { t: 700, x: 45, y: 55, action: "dribble" },
          { t: 1100, x: 44, y: 70, action: "shoot" },
        ],
        onBallDefender: [
          { t: 0, x: 52, y: 14 },
          { t: 700, x: 48, y: 50 },
        ],
      },
    },
    {
      optionId: "look-extra-pass",
      resultLabel: "Clock expires — shot clock violation",
      outcomeDurationMs: 1200,
      continuation: {
        ball: [
          { t: 0, x: 50, y: 14, action: "dribble" },
          { t: 800, x: 50, y: 15 },
        ],
      },
    },
    {
      optionId: "call-timeout",
      resultLabel: "No timeout available — delay of game",
      outcomeDurationMs: 1000,
      continuation: {
        ball: [{ t: 0, x: 50, y: 14 }],
      },
    },
    {
      optionId: "force-deep-three",
      resultLabel: "Contested, off the back rim at the buzzer",
      outcomeDurationMs: 1200,
      continuation: {
        ball: [
          { t: 0, x: 50, y: 14, action: "shoot" },
          { t: 600, x: 50, y: 10 },
        ],
      },
    },
  ],
  tags: ["late-clock", "isolation"],
};
