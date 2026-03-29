interface ScoreBarProps {
  label: string;
  value: number;
  description: string;
}

export default function ScoreBar({ label, value, description }: ScoreBarProps) {
  const isCritical = value < 3.0;
  const colorClass = isCritical ? "text-error" : "text-primary";
  const barColor = isCritical ? "bg-error" : "bg-primary";
  const widthPercent = Math.min(100, Math.max(0, value * 10));

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold text-on-surface uppercase tracking-tight">
          {label}
        </span>
        <span className={`text-lg font-black ${colorClass}`}>
          {value.toFixed(1)}
        </span>
      </div>
      <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${widthPercent}%` }}
        />
      </div>
      <p className="text-xs text-on-surface-variant leading-relaxed">
        {description}
      </p>
    </div>
  );
}
