import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

const data = [
  { subject: "Food", product1: 120, product2: 110 },
  { subject: "Transport", product1: 98, product2: 130 },
  { subject: "Utilities", product1: 86, product2: 105 },
  { subject: "Entertainment", product1: 99, product2: 90 },
  { subject: "Health", product1: 85, product2: 100 },
];

/**
 * RadarChart Component
 *
 * Compares multiple dimensions (e.g., KPI scores).
 *
 * Data shape:
 * [
 *   { subject: string; A: number },
 *   ...
 * ]
 *
 * Props:
 * - data: metric set per subject
 * - dataKey: metric field
 *
 * Best for:
 * - Performance profiles
 * - Category scoring
 */
export const MyRadarChart = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis />
        <Radar
          name="Product 1"
          dataKey="product1"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.6}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};
