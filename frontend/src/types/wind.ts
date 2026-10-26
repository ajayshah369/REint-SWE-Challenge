export interface ForecastRecord {
  dataset: string;
  publishTime: string;
  startTime: string;
  generation: number;
}

export interface ActualRecord extends ForecastRecord {
  settlementDate: string;
  settlementPeriod: number;
  fuelType: string;
}

export interface WindResponse {
  decision_date: string;
  delivery_date: string;
  forecasts: ForecastRecord[];
  actuals: ActualRecord[];
}

export interface GenerationPoint {
  timestamp: string;
  time: string;
  forecast: number | null;
  actual: number | null;
  error: number | null;
}

export interface WindAnalysis {
  points: GenerationPoint[];
  averageForecast: number | null;
  averageActual: number | null;
  mae: number | null;
  bias: number | null;
  rmse: number | null;
  matchedCount: number;
  latestPublication: string | null;
  hourly: boolean;
}

export type ChartType = "line" | "bar";
export interface GenerationChartProps {
  data: GenerationPoint[];
}
