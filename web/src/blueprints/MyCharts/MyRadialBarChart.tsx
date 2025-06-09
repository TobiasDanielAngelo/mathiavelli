import {
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { MyCustomTooltip } from "./MyCustomToolTip";

export const radialBarData = [
  { name: "Food", value: 130 },
  { name: "Transport", value: 98 },
  { name: "Utilities", value: 86 },
];

/**
 * RadialBarChart Component
 *
 * Visualizes values in a radial format (circular bars).
 *
 * Data shape:
 * [
 *   { name: string; value: number; fill?: string },
 *   ...
 * ]
 *
 * Props:
 * - data: circular bar segments
 * - dataKey: value to display
 *
 * Best for:
 * - Ranked comparisons (like pie but with bars)
 * - Dashboard KPIs
 */
export const MyRadialBarChart = () => (
  <ResponsiveContainer width="100%" height="100%">
    <RadialBarChart
      innerRadius="20%"
      outerRadius="90%"
      data={radialBarData}
      startAngle={180}
      endAngle={0}
    >
      <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" />
      <Tooltip content={<MyCustomTooltip />} />
    </RadialBarChart>
  </ResponsiveContainer>
);
