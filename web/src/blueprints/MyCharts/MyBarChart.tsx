import {
  Bar,
  BarChart,
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
 * BarChart Component
 *
 * Compares categories (e.g., expenses by category).
 *
 * Data shape:
 * [
 *   { category: string; count: number },
 *   ...
 * ]
 *
 * Props:
 * - data: list of category items
 * - dataKey: key to extract numeric value (e.g., "count")
 *
 * Best for:
 * - Categorical comparison
 * - Budget breakdowns
 */

export const MyBarChart = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray={"5 10"} />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip content={<MyCustomTooltip />} />
        <Bar dataKey="product1" fill="gray" />
        <Bar dataKey="product2" fill="darkblue" />
      </BarChart>
    </ResponsiveContainer>
  );
};
