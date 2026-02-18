"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface StarHistoryChartProps {
  data: { date: string; stars: number }[];
}

export function StarHistoryChart({ data }: StarHistoryChartProps) {
  if (data.length < 2) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Not enough data to display chart.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          tickFormatter={(v) => {
            const d = new Date(v);
            return `${d.getMonth() + 1}/${d.getDate()}`;
          }}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickFormatter={(v) =>
            v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toString()
          }
        />
        <Tooltip
          labelFormatter={(v) => new Date(v as string).toLocaleDateString()}
          formatter={(value) => [Number(value).toLocaleString(), "Stars"]}
        />
        <Line
          type="monotone"
          dataKey="stars"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
