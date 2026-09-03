export function StatTile({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string;
  sublabel?: string;
}) {
  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900/60 px-6 py-5">
      <div className="text-3xl font-semibold tabular-nums text-white">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-white/40">{label}</div>
      {sublabel && <div className="mt-2 text-xs text-white/30">{sublabel}</div>}
    </div>
  );
}
