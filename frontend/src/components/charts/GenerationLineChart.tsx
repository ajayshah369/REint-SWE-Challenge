import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { GenerationChartProps } from "../../types/wind";
import {
  axisStyle,
  chartColors,
  chartMargin,
  tooltipStyle,
} from "./chartConfig";

export function GenerationLineChart({ data }: GenerationChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
      <LineChart data={data} margin={chartMargin} accessibilityLayer>
        <CartesianGrid
          stroke={chartColors.grid}
          vertical={false}
          strokeDasharray="3 4"
        />
        <XAxis
          dataKey="time"
          tick={axisStyle}
          axisLine={false}
          tickLine={false}
          minTickGap={35}
        />
        <YAxis
          tick={axisStyle}
          axisLine={false}
          tickLine={false}
          width={55}
          tickFormatter={(value: number) => `${value / 1000}k`}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelFormatter={(label) => `${label} UTC`}
        />
        <Legend
          iconType="circle"
          wrapperStyle={{ paddingTop: 18, fontSize: 12 }}
        />
        <Line
          name="Forecast (MW)"
          dataKey="forecast"
          stroke={chartColors.forecast}
          strokeWidth={2.5}
          dot={{ r: 2 }}
          connectNulls={false}
          isAnimationActive={false}
        />
        <Line
          name="Actual (MW)"
          dataKey="actual"
          stroke={chartColors.actual}
          strokeWidth={2.5}
          dot={{ r: 2 }}
          connectNulls={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
