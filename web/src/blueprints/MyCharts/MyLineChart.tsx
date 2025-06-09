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
import { MyCustomTooltip } from "./MyCustomToolTip";
import { KV } from "../ItemDetails";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { getStoreSignature, toOptions } from "../../constants/helpers";
import { MyMultiDropdownSelector } from "../MyMultiDropdownSelector";

function moveKeysToFront(obj: Record<string, any>, keys: string[]) {
  const reordered: Record<string, any> = {};
  keys.forEach((k) => {
    if (k in obj) reordered[k] = obj[k];
  });
  Object.keys(obj).forEach((k) => {
    if (!keys.includes(k)) reordered[k] = obj[k];
  });
  return reordered;
}

function transformForLineChart<T extends Record<string, any>>(
  data: T[],
  traceKey: keyof T,
  xAxis: keyof T,
  yAxis: keyof T,
  totalTitle: string,
  excludedFromTotal?: string[]
) {
  const result: Record<string, any> = {};

  const cumTotalTitle = "Cum. Total";

  data.forEach((item) => {
    const x = item[xAxis];
    const trace = item[traceKey];
    const y = item[yAxis];

    if (!result[x]) result[x] = { [xAxis]: x, [totalTitle as string]: 0 };
    result[x][trace] = y;
    result[x][totalTitle] +=
      typeof y === "number" && !excludedFromTotal?.includes(trace) ? y : 0;
  });

  // Sort xAxis and compute cumulative
  const sorted = Object.values(result).sort((a, b) =>
    String(a[xAxis]).localeCompare(String(b[xAxis]))
  );

  let cum = 0;
  const reordered = sorted.map((item) => {
    cum += item[totalTitle];
    item[cumTotalTitle] = cum;
    return moveKeysToFront(item, [totalTitle, cumTotalTitle]);
  });

  return reordered;
  // return Object.values(result);
}

type MyLineChartProps<T extends Record<string, any>> = {
  data: T[];
  traceKey: keyof T;
  xKey: keyof T;
  yKey: keyof T;
  width?: string | number;
  height?: string | number;
  colors?: string[];
  itemMap?: KV<any>[];
  formatter?: (value: number, name: string) => string[];
  excludedFromTotal?: string[];
  selectionLabel?: string;
};

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
    colors = [
      "#4FC3F7", // soft sky blue
      "#81C784", // soft green
      "#FFB74D", // soft orange
      "#BA68C8", // soft purple
      "#64B5F6", // soft blue
      "#E57373", // soft red
      "#AED581", // soft lime green
      "#FFD54F", // soft yellow
    ],
    traceKey,
    xKey,
    yKey,
    itemMap,
    formatter,
    excludedFromTotal,
    selectionLabel,
  }: MyLineChartProps<T>) => {
    const cleanedData = useMemo(
      () =>
        !data?.length
          ? []
          : (("$" in data[0] ? data.map((s: any) => s.$) : data) as T[]),
      [
        getStoreSignature(
          !data?.length
            ? []
            : (("$" in data[0] ? data.map((s: any) => s.$) : data) as T[])
        ),
      ]
    );

    const kv = itemMap?.find((s) => s.key === traceKey);

    const resolvedData = cleanedData.map((s) => ({
      ...s,
      [traceKey]:
        kv?.label === ""
          ? kv.values.find((_, i) => i === s[traceKey])
          : kv?.values.find((v) => v.id === s[traceKey])?.[kv.label] ??
            "—" ??
            s[traceKey],
    }));

    const totalTitle = `Total${
      excludedFromTotal && excludedFromTotal.length > 0
        ? " excl. " + excludedFromTotal.join(",")
        : ""
    }`;

    const [shownFields, setShownFields] = useState<string[]>([]);

    const transformedData = transformForLineChart(
      resolvedData,
      traceKey,
      xKey,
      yKey,
      totalTitle,
      excludedFromTotal
    );

    const allTraceKeys = Array.from(
      new Set(transformedData.flatMap((item) => Object.keys(item)))
    ).filter((key) => key !== xKey);

    console.log();

    useEffect(() => {
      setShownFields([...allTraceKeys]);
    }, [allTraceKeys.length]);

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
