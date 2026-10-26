import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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

export function GenerationBarChart({ data }: GenerationChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
      <BarChart data={data} margin={chartMargin} accessibilityLayer barGap={2}>
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
        <Bar
          name="Forecast (MW)"
          dataKey="forecast"
          fill={chartColors.forecast}
          radius={[3, 3, 0, 0]}
          maxBarSize={16}
          isAnimationActive={false}
        />
        <Bar
          name="Actual (MW)"
          dataKey="actual"
          fill={chartColors.actual}
          radius={[3, 3, 0, 0]}
          maxBarSize={16}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
