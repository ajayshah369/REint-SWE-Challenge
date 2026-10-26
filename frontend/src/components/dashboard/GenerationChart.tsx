import { lazy, Suspense, useState } from "react";
import { ChartColumn, ChartLine, ChartNoAxesCombined } from "lucide-react";
import type { ChartType, WindAnalysis } from "../../types/wind";
import { formatDate } from "../../utils/format";

const GenerationBarChart = lazy(() =>
  import("../charts/GenerationBarChart").then((module) => ({
    default: module.GenerationBarChart,
  })),
);
const GenerationLineChart = lazy(() =>
  import("../charts/GenerationLineChart").then((module) => ({
    default: module.GenerationLineChart,
  })),
);

export function GenerationChart({
  analysis,
  deliveryDate,
}: {
  analysis: WindAnalysis;
  deliveryDate: string;
}) {
  const [type, setType] = useState<ChartType>("line");
  return (
    <section className="panel chart-panel">
      <div className="panel-heading">
        <div>
          <div className="eyebrow">GENERATION PROFILE</div>
          <h2>Forecast meets reality</h2>
          <p>
            {formatDate(deliveryDate)} ·{" "}
            {analysis.hourly
              ? "Hourly comparison"
              : "Available generation periods"}{" "}
            · MW
          </p>
        </div>
        <div className="chart-toggle" role="group" aria-label="Chart type">
          <button
            aria-pressed={type === "line"}
            onClick={() => setType("line")}
          >
            <ChartLine size={16} />
            Line
          </button>
          <button aria-pressed={type === "bar"} onClick={() => setType("bar")}>
            <ChartColumn size={16} />
            Bar
          </button>
        </div>
      </div>
      {analysis.points.length ? (
        <div
          className="chart-container"
          role="img"
          aria-label={`${type} chart comparing forecast and actual wind power; exact values are in the table below`}
        >
          <Suspense
            fallback={
              <div className="empty-chart" role="status">
                Loading chart…
              </div>
            }
          >
            {type === "line" ? (
              <GenerationLineChart data={analysis.points} />
            ) : (
              <GenerationBarChart data={analysis.points} />
            )}
          </Suspense>
        </div>
      ) : (
        <div className="empty-chart">
          <ChartNoAxesCombined size={38} strokeWidth={1.2} />
          <h3>No generation data available</h3>
          <p>
            Try a historical decision date such as 1 January 2026.
            <br />
            Future forecasts appear only once Elexon publishes them.
          </p>
        </div>
      )}
      <div className="chart-footnote">
        <span className="small-dot" />
        {analysis.hourly
          ? "Actuals are hourly averages of two half-hour readings. Incomplete hours remain missing."
          : "Values are aligned by generation time. Missing readings remain empty."}
      </div>
    </section>
  );
}
