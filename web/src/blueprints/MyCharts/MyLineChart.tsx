import { observer } from "mobx-react-lite";
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
import { COLORS, MyTrendChartProps, useTrendChart } from ".";
import { MyMultiDropdownSelector } from "../MyMultiDropdownSelector";
import { MyCustomTooltip } from "./MyCustomToolTip";

/**
 * LineChart Component
 *
 * Displays trends over time (e.g., sales per month).
 *
 * Data shape:
 * [
 *   { name: string; value: number },
 *   ...
 * ]
 *
 * Props:
 * - data: list of time series points
 * - dataKey: key to extract value (e.g., "value")
 *
 * Best for:
 * - Time series data
 * - Performance monitoring
 */

export const MyLineChart = observer(
  <T extends Record<string, any>>({
    data,
    width = "100%",
    height = "85%",
    colors = COLORS,
    traceKey,
    xKey,
    yKey,
    itemMap,
    formatter,
    excludedFromTotal,
    selectionLabel,
  }: MyTrendChartProps<T>) => {
    const { allTraceKeys, transformedData, shownFields, setShownFields } =
      useTrendChart(data, traceKey, xKey, yKey, itemMap, excludedFromTotal);

    return (
      <div className="w-full h-full">
        <MyMultiDropdownSelector
          value={shownFields}
          onChangeValue={(t) => setShownFields(t as string[])}
          options={allTraceKeys.map((s) => ({ id: s, name: s }))}
          label={selectionLabel ?? "Items"}
          isAll
        />
        <ResponsiveContainer width={width} height={height}>
          <LineChart data={transformedData}>
            <CartesianGrid strokeDasharray={"5 10"} />
            <Legend />
            <XAxis dataKey={xKey as string} />
            <YAxis />
            <Tooltip content={<MyCustomTooltip />} formatter={formatter} />
            {allTraceKeys
              .filter((s) => shownFields.includes(s))
              .map((key, i) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[i % colors.length]}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
);
