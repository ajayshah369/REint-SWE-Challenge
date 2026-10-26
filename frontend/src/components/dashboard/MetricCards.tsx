import { Activity, ArrowDownUp, Gauge, Wind } from "lucide-react";
import type { WindAnalysis } from "../../types/wind";
import { formatPower } from "../../utils/format";

export function MetricCards({ analysis }: { analysis: WindAnalysis }) {
  const metrics = [
    {
      label: "Forecast generation",
      value: analysis.averageForecast,
      note: "Average of available forecast periods",
      icon: Wind,
      color: "teal",
    },
    {
      label: "Actual generation",
      value: analysis.averageActual,
      note: "Average of available actual periods",
      icon: Activity,
      color: "amber",
    },
    {
      label: "Mean absolute error",
      value: analysis.mae,
      note: analysis.matchedCount
        ? `${analysis.matchedCount} matched periods compared`
        : "Waiting for comparable actuals",
      icon: Gauge,
      color: "blue",
    },
    {
      label: "Forecast bias",
      value: analysis.bias,
      note: "Positive: overforecast · Negative: underforecast",
      icon: ArrowDownUp,
      color: "slate",
    },
  ];
  return (
    <section className="metrics-grid" aria-label="Generation summary">
      {metrics.map(({ label, value, note, icon: Icon, color }) => (
        <article className="metric-card" key={label}>
          <div className="metric-top">
            <span>{label}</span>
            <Icon size={18} className={`metric-icon ${color}`} />
          </div>
          <div className="metric-value">
            {formatPower(value)}
            {value !== null && <span>MW</span>}
          </div>
          <p>{note}</p>
        </article>
      ))}
    </section>
  );
}
