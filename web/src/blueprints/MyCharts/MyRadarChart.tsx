import { observer } from "mobx-react-lite";
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { COLORS, MyTrendChartProps, useTrendChart } from ".";
import { MyMultiDropdownSelector } from "../MyMultiDropdownSelector";
import { MyCustomTooltip } from "./MyCustomToolTip";

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

export const MyRadarChart = observer(
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
      useTrendChart(
        data,
        traceKey ?? "",
        xKey,
        yKey,
        itemMap,
        excludedFromTotal
      );

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
          <RadarChart data={transformedData}>
            <PolarGrid strokeDasharray={"5 10"} />
            <PolarRadiusAxis />
            <PolarAngleAxis dataKey={xKey as string} />
            <Legend />
            <Tooltip content={<MyCustomTooltip />} formatter={formatter} />
            {allTraceKeys
              .filter((s) => shownFields.includes(s))
              .map((key, i) => (
                <Radar
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[i % colors.length]}
                  fill={colors[i % colors.length]}
                />
              ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  }
);
