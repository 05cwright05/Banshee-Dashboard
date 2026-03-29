import { Scores, SCORE_LABELS } from "@/lib/types";

interface CompositeBadgeProps {
  scores: Scores;
  compositeScore: number;
}

export default function CompositeBadge({
  scores,
  compositeScore,
}: CompositeBadgeProps) {
  const scoreKeys = Object.keys(SCORE_LABELS) as (keyof Scores)[];

  const sorted = scoreKeys
    .map((key) => ({ key, label: SCORE_LABELS[key], value: scores[key].value }))
    .sort((a, b) => a.value - b.value);

  const lowest = sorted[0];
  const highest = sorted[sorted.length - 1];

  const tier =
    compositeScore >= 8
      ? "High Resilience"
      : compositeScore >= 5
        ? "Moderate Resilience"
        : "Low Resilience";

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-1 p-6 bg-surface-container rounded-xl">
        <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-3">
          Threat Vector Summary
        </p>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          Target exhibited high resistance to standard{" "}
          <span className="text-primary font-bold">{highest.label}</span>{" "}
          patterns. However, a significant vulnerability was detected during{" "}
          <span className="text-error font-bold">{lowest.label}</span> phases
          where the lowest score of {lowest.value.toFixed(1)} was recorded.
        </p>
      </div>
      <div className="w-full md:w-64 p-6 bg-primary-container text-on-primary-container rounded-xl flex flex-col justify-between">
        <p className="text-xs font-bold uppercase tracking-widest">
          Composite Health
        </p>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-4xl font-extrabold">
            {compositeScore.toFixed(1)}
          </span>
          <span className="text-sm font-medium opacity-80">/ 10.0</span>
        </div>
        <p className="text-[11px] font-medium mt-2 leading-tight">
          Overall security posture is within the &ldquo;{tier}&rdquo; tier for
          the target sector.
        </p>
      </div>
    </div>
  );
}
