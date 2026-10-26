import type {
  ForecastRecord,
  GenerationPoint,
  WindAnalysis,
  WindResponse,
} from "../types/wind";

function mean(values: number[]): number | null {
  return values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : null;
}

export function analyzeWind(data: WindResponse): WindAnalysis {
  const forecastByTime = new Map<number, ForecastRecord>();
  const deliveryStart = Date.parse(`${data.delivery_date}T00:00:00Z`);
  const deliveryEnd = deliveryStart + 86_400_000;
  const decisionStart = Date.parse(`${data.decision_date}T00:00:00Z`);

  // A forecast revision is eligible only if issued on the selected decision day.
  for (const record of data.forecasts) {
    const timestamp = Date.parse(record.startTime);
    const publication = Date.parse(record.publishTime);
    if (
      timestamp < deliveryStart ||
      timestamp >= deliveryEnd ||
      publication < decisionStart ||
      publication >= decisionStart + 86_400_000
    )
      continue;
    const previous = forecastByTime.get(timestamp);
    if (!previous || publication > Date.parse(previous.publishTime))
      forecastByTime.set(timestamp, record);
  }

  const times = [...forecastByTime.keys()].sort((a, b) => a - b);
  const hourly =
    times.length > 0 && times.every((time) => time % 3_600_000 === 0);
  const actualByTime = new Map<number, ForecastRecord>();
  for (const record of data.actuals) {
    const timestamp = Date.parse(record.startTime);
    if (
      record.fuelType !== "WIND" ||
      timestamp < deliveryStart ||
      timestamp >= deliveryEnd
    )
      continue;
    const previous = actualByTime.get(timestamp);
    if (
      !previous ||
      Date.parse(record.publishTime) > Date.parse(previous.publishTime)
    )
      actualByTime.set(timestamp, record);
  }

  const actualValues = new Map<number, number | null>();
  if (hourly) {
    const hours = new Set(
      [...actualByTime.keys()].map(
        (time) => Math.floor(time / 3_600_000) * 3_600_000,
      ),
    );
    for (const hour of hours) {
      const first = actualByTime.get(hour);
      const second = actualByTime.get(hour + 1_800_000);
      // An incomplete hour stays missing, rather than looking like zero generation.
      actualValues.set(
        hour,
        first && second ? (first.generation + second.generation) / 2 : null,
      );
    }
  } else {
    for (const [time, record] of actualByTime)
      actualValues.set(time, record.generation);
  }

  const allTimes = [...new Set([...times, ...actualValues.keys()])].sort(
    (a, b) => a - b,
  );
  const points: GenerationPoint[] = allTimes.map((time) => {
    const timestamp = new Date(time).toISOString();
    const forecast = forecastByTime.get(time)?.generation ?? null;
    const actual = actualValues.get(time) ?? null;
    return {
      timestamp,
      time: timestamp.slice(11, 16),
      forecast,
      actual,
      error: forecast !== null && actual !== null ? forecast - actual : null,
    };
  });
  const errors = points.flatMap((point) =>
    point.error === null ? [] : [point.error],
  );
  const squaredMean = mean(errors.map((error) => error ** 2));
  const publications = [...forecastByTime.values()]
    .map((record) => record.publishTime)
    .sort((a, b) => Date.parse(a) - Date.parse(b));

  return {
    points,
    hourly,
    matchedCount: errors.length,
    averageForecast: mean(
      points.flatMap((point) =>
        point.forecast === null ? [] : [point.forecast],
      ),
    ),
    averageActual: mean(
      points.flatMap((point) => (point.actual === null ? [] : [point.actual])),
    ),
    mae: mean(errors.map(Math.abs)),
    bias: mean(errors),
    rmse: squaredMean === null ? null : Math.sqrt(squaredMean),
    latestPublication: publications.at(-1) ?? null,
  };
}
