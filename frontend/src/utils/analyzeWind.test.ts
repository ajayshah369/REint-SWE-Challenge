import { describe, expect, it } from "vitest";
import { analyzeWind } from "./analyzeWind";
import type { ActualRecord, ForecastRecord, WindResponse } from "../types/wind";

const forecast = (
  time: string,
  generation: number,
  published = "2026-01-01T09:30:00Z",
): ForecastRecord => ({
  dataset: "WINDFOR",
  startTime: `2026-01-02T${time}:00Z`,
  publishTime: published,
  generation,
});
const actual = (time: string, generation: number): ActualRecord => ({
  ...forecast(time, generation, "2026-01-02T23:59:00Z"),
  dataset: "FUELHH",
  settlementDate: "2026-01-02",
  settlementPeriod: 1,
  fuelType: "WIND",
});
const response = (
  forecasts: ForecastRecord[],
  actuals: ActualRecord[],
): WindResponse => ({
  decision_date: "2026-01-01",
  delivery_date: "2026-01-02",
  forecasts,
  actuals,
});

describe("wind comparison", () => {
  it("chooses eligible latest revisions, averages actuals and computes paired error metrics", () => {
    const result = analyzeWind(
      response(
        [
          forecast("09:00", 100),
          forecast("09:00", 120, "2026-01-01T22:30:00Z"),
          forecast("09:00", 999, "2026-01-02T01:00:00Z"),
          forecast("10:00", 200),
        ],
        [
          actual("09:00", 80),
          actual("09:30", 100),
          actual("10:00", 200),
          actual("10:30", 220),
        ],
      ),
    );
    expect(result.points.map((point) => point.error)).toEqual([30, -10]);
    expect(result.averageActual).toBe(150);
    expect(result.mae).toBe(20);
    expect(result.bias).toBe(10);
    expect(result.rmse).toBeCloseTo(Math.sqrt(500));
    expect(result.matchedCount).toBe(2);
  });
  it("does not treat a missing half hour as zero or as a complete hour", () => {
    const result = analyzeWind(
      response([forecast("09:00", 100)], [actual("09:00", 80)]),
    );
    expect(result.points[0].actual).toBeNull();
    expect(result.mae).toBeNull();
  });
  it("keeps legitimate zero generation", () => {
    const result = analyzeWind(
      response(
        [forecast("09:00", 0)],
        [actual("09:00", 0), actual("09:30", 0)],
      ),
    );
    expect(result.mae).toBe(0);
    expect(result.averageActual).toBe(0);
  });
  it("shows future forecast data without fabricating actuals or errors", () => {
    const result = analyzeWind(response([forecast("09:00", 100)], []));
    expect(result.points[0].forecast).toBe(100);
    expect(result.averageActual).toBeNull();
    expect(result.mae).toBeNull();
  });
  it("handles entirely empty datasets", () => {
    const result = analyzeWind(response([], []));
    expect(result.points).toEqual([]);
    expect(result.averageForecast).toBeNull();
    expect(result.bias).toBeNull();
  });
  it("matches half-hourly forecasts directly without hourly averaging", () => {
    const result = analyzeWind(
      response(
        [forecast("09:00", 100), forecast("09:30", 150)],
        [actual("09:00", 80), actual("09:30", 110)],
      ),
    );
    expect(result.hourly).toBe(false);
    expect(result.mae).toBe(30);
    expect(result.points).toHaveLength(2);
  });
});
