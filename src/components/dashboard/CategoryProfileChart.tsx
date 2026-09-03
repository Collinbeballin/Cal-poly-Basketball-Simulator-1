import { categoryLabel } from "@/lib/content/labels";
import type { CategoryProfile } from "@/lib/data/types";
import type { ScenarioCategory } from "@/lib/scenario/types";

export function CategoryProfileChart({
  profiles,
  onSelectCategory,
}: {
  profiles: CategoryProfile[];
  onSelectCategory?: (category: ScenarioCategory) => void;
}) {
  if (profiles.length === 0) {
    return (
      <p className="text-sm text-white/40">
        No reps recorded yet — complete a training session to build a profile.
      </p>
    );
  }

  const sorted = [...profiles].sort((a, b) => b.accuracy - a.accuracy);

  return (
    <div className="flex flex-col gap-4">
      {sorted.map((profile) => {
        const Row = onSelectCategory ? "button" : "div";
        return (
          <Row
            key={profile.category}
            onClick={
              onSelectCategory ? () => onSelectCategory(profile.category) : undefined
            }
            className={onSelectCategory ? "text-left" : undefined}
          >
            <div className="mb-1.5 flex items-baseline justify-between text-sm">
              <span
                className={`text-white/80 ${onSelectCategory ? "hover:text-accent-bright" : ""}`}
              >
                {categoryLabel(profile.category)}
              </span>
              <span className="font-mono tabular-nums text-white/50">
                {Math.round(profile.accuracy * 100)}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-700">
              <div
                className={`h-full rounded-full ${barColor(profile.accuracy)}`}
                style={{ width: `${Math.max(3, profile.accuracy * 100)}%` }}
              />
            </div>
          </Row>
        );
      })}
    </div>
  );
}

function barColor(accuracy: number): string {
  if (accuracy >= 0.85) return "bg-signal-correct";
  if (accuracy >= 0.65) return "bg-accent";
  return "bg-signal-incorrect";
}
