import { useEffect, useMemo, useState } from "react";
import { KV } from "../ItemDetails";
import { getStoreSignature } from "../../constants/helpers";

export type MyTrendChartProps<T extends Record<string, any>> = {
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

export type MyCircleChartProps<T extends Record<string, any>> = {
  data: T[];
  nameKey: keyof T;
  dataKey: keyof T;
  width?: string | number;
  height?: string | number;
  colors?: string[];
  itemMap?: KV<any>[];
  formatter?: (value: number, name: string) => string[];
};

export function moveKeysToFront(obj: Record<string, any>, keys: string[]) {
  const reordered: Record<string, any> = {};
  keys.forEach((k) => {
    if (k in obj) reordered[k] = obj[k];
  });
  Object.keys(obj).forEach((k) => {
    if (!keys.includes(k)) reordered[k] = obj[k];
  });
  return reordered;
}

export function transformForTrendChart<T extends Record<string, any>>(
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

export const COLORS = [
  "#4FC3F7", // soft sky blue
  "#81C784", // soft green
  "#FFB74D", // soft orange
  "#BA68C8", // soft purple
  "#64B5F6", // soft blue
  "#E57373", // soft red
  "#AED581", // soft lime green
  "#FFD54F", // soft yellow
];

export const useTrendChart = <T extends Record<string, any>>(
  data: T[],
  traceKey: keyof T,
  xKey: keyof T,
  yKey: keyof T,
  itemMap?: KV<any>[],
  excludedFromTotal?: string[]
) => {
  const [shownFields, setShownFields] = useState<string[]>([]);
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

  const transformedData = transformForTrendChart(
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

  useEffect(() => {
    setShownFields([...allTraceKeys]);
  }, [allTraceKeys.length]);

  return { allTraceKeys, transformedData, shownFields, setShownFields };
};

export const useCircleChart = <T extends Record<string, any>>(
  data: T[],
  nameKey: keyof T,
  dataKey: keyof T,
  itemMap?: KV<any>[]
) => {
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

  const kv = itemMap?.find((s) => s.key === nameKey);
  const resolvedData = cleanedData.map((s) => ({
    [nameKey]:
      kv?.label === ""
        ? kv.values.find((_, i) => i === s[nameKey])
        : kv?.values.find((v) => v.id === s[nameKey])?.[kv.label] ??
          "—" ??
          s[nameKey],
    [dataKey]: s[dataKey],
  }));

  return { resolvedData };
};
