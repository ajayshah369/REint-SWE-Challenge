import type { WindAnalysis } from "../../types/wind";
import { formatPower } from "../../utils/format";

export function GenerationTable({ analysis }: { analysis: WindAnalysis }) {
  return (
    <section className="panel table-panel">
      <div className="panel-heading">
        <div>
          <div className="eyebrow">THE NUMBERS BEHIND THE CHART</div>
          <h2>Period breakdown</h2>
        </div>
        <span className="count-badge">{analysis.points.length} periods</span>
      </div>
      <div className="table-scroll">
        <table>
          <caption className="sr-only">
            Wind generation and forecast errors in MW, by UTC generation time
          </caption>
          <thead>
            <tr>
              <th scope="col">Time (UTC)</th>
              <th scope="col">Forecast (MW)</th>
              <th scope="col">Actual (MW)</th>
              <th scope="col">Error (MW)</th>
              <th scope="col">Assessment</th>
            </tr>
          </thead>
          <tbody>
            {analysis.points.map((point) => (
              <tr key={point.timestamp}>
                <th scope="row">{point.time}</th>
                <td>{formatPower(point.forecast)}</td>
                <td>{formatPower(point.actual)}</td>
                <td
                  className={
                    point.error === null
                      ? ""
                      : point.error > 0
                        ? "positive-error"
                        : "negative-error"
                  }
                >
                  {point.error !== null && point.error > 0 ? "+" : ""}
                  {formatPower(point.error)}
                </td>
                <td>
                  <span
                    className={`assessment ${point.error === null ? "pending" : point.error > 0 ? "over" : "under"}`}
                  >
                    {point.error === null
                      ? "Awaiting data"
                      : point.error > 0
                        ? "Overforecast"
                        : point.error < 0
                          ? "Underforecast"
                          : "On target"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!analysis.points.length && (
          <p className="table-empty">
            No periods to display for this delivery day.
          </p>
        )}
      </div>
      <div className="table-footer">
        Error = forecast − actual. Summary errors use matched periods only.
        RMSE: {formatPower(analysis.rmse)}
        {analysis.rmse !== null ? " MW" : ""}.
      </div>
    </section>
  );
}
