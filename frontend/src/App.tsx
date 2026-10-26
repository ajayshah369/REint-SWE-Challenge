import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Info,
  LoaderCircle,
  RefreshCw,
  Wind,
} from "lucide-react";
import { useWindData } from "./hooks/useWindData";
import { analyzeWind } from "./utils/analyzeWind";
import { formatPublication } from "./utils/format";
import { DateSelector } from "./components/dashboard/DateSelector";
import { MetricCards } from "./components/dashboard/MetricCards";
import { GenerationChart } from "./components/dashboard/GenerationChart";
import { GenerationTable } from "./components/dashboard/GenerationTable";

function App() {
  const [date, setDate] = useState("2026-01-01");
  const { state, reload } = useWindData(date);
  const data = state.status === "success" ? state.data : null;
  const analysis = useMemo(() => (data ? analyzeWind(data) : null), [data]);
  const deliveryDate = new Date(Date.parse(`${date}T00:00:00Z`) + 86_400_000)
    .toISOString()
    .slice(0, 10);

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <a href="#" className="brand" aria-label="WindScope home">
            <span className="brand-mark">
              <Wind size={24} />
            </span>
            Wind<span className="brand-light">Scope</span>
          </a>
          <div className="header-right">
            <span className="desktop-label">GB WIND INTELLIGENCE</span>
            <span className="source-badge">
              <span className="small-dot" />
              Elexon data
            </span>
          </div>
        </div>
      </header>
      <main>
        <div className="page-intro">
          <div>
            <div className="eyebrow">DAY-AHEAD DECISION SUPPORT</div>
            <h1>A clearer view of wind.</h1>
            <p>
              Explore the forecast. Understand the generation. Measure the
              difference.
            </p>
          </div>
          <a
            className="source-link"
            href="https://bmrs.elexon.co.uk/"
            target="_blank"
            rel="noreferrer"
          >
            Explore data source
            <ArrowUpRight size={16} />
          </a>
        </div>
        <DateSelector
          date={date}
          deliveryDate={deliveryDate}
          onChange={setDate}
        />
        <div className="section-heading">
          <div>
            <h2>Delivery overview</h2>
            <span>National wind generation · Great Britain</span>
          </div>
          <button
            className="refresh-button"
            onClick={reload}
            disabled={state.status === "loading"}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
        <div aria-live="polite" aria-busy={state.status === "loading"}>
          {state.status === "loading" && (
            <div className="panel loading-state" role="status">
              <LoaderCircle className="spinner" size={27} />
              <h2>Gathering wind data</h2>
              <p>
                Fetching next-day forecasts and actual generation from Elexon…
              </p>
            </div>
          )}
          {state.status === "error" && (
            <div className="panel error-state" role="alert">
              <AlertCircle size={26} />
              <h2>We couldn’t load this day</h2>
              <p>{state.message}</p>
              <button className="primary-button" onClick={reload}>
                Try again
              </button>
            </div>
          )}
        </div>
        {analysis && data && (
          <>
            <MetricCards analysis={analysis} />
            {!analysis.matchedCount && analysis.points.length > 0 && (
              <div className="notice">
                <Info size={18} />
                <p>
                  Forecast error will be available when forecast and actual
                  generation cover the same periods. Actuals for a future
                  delivery day are not available yet.
                </p>
              </div>
            )}
            <GenerationChart
              analysis={analysis}
              deliveryDate={data.delivery_date}
            />
            <div className="method-note">
              <Info size={17} />
              <p>
                <strong>About this comparison.</strong> Latest forecast issued
                on the selected decision date, per generation period
                {analysis.latestPublication
                  ? ` (latest publication: ${formatPublication(analysis.latestPublication)} UTC)`
                  : ""}
                . This uses the full UTC day, rather than a specific market
                purchase cutoff. Forecasts may change during the day.
              </p>
            </div>
            <GenerationTable analysis={analysis} />
          </>
        )}
        <footer>
          <span>
            <Wind size={15} />
            WindScope · Built for a clearer energy picture
          </span>
          <span>Source: Elexon WINDFOR & FUELHH · All chart times UTC</span>
        </footer>
      </main>
    </div>
  );
}
export default App;
