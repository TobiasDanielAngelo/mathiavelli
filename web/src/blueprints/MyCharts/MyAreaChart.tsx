import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MyCustomTooltip } from "./MyCustomToolTip";

const data = [
  {
    name: "January",
    product1: 300,
    product2: 400,
  },
  {
    name: "February",
    product1: 500,
    product2: 200,
  },
  {
    name: "March",
    product1: 200,
    product2: 300,
  },
];

/**
 * AreaChart Component
 *
 * Visualizes cumulative values (e.g., growth over time).
 *
 * Data shape:
 * [
 *   { period: string; total: number },
 *   ...
 * ]
 *
 * Props:
 * - data: time-based dataset
 * - dataKey: key to extract total value
 *
 * Best for:
 * - Cumulative insights
 * - Revenue trends
 */
export const MyAreaChart = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray={"5 10"} />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip content={<MyCustomTooltip />} />
        <Area
          type="monotone"
          dataKey="product1"
          stroke="brown"
          fill="gold"
          stackId={2}
        />
        <Area
          type="monotone"
          dataKey="product2"
          stroke="blue"
          fill="darkblue"
          stackId={1}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
