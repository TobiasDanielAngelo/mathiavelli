import { useEffect, useMemo, useState } from "react";
import { camelCaseToWords, getStoreSignature } from "../../constants/helpers";
import { KV } from "../../constants/interfaces";
import { LineChartData } from "react-native-chart-kit/dist/line-chart/LineChart";

export type MyTrendChartProps<T extends Record<string, any>> = {
  data: T[];
  traceKey?: keyof T;
  xKey: keyof T;
  yKey: keyof T;
  yPrefix?: string;
  ySuffix?: string;
  width?: string | number;
  height?: string | number;
  colors?: string[];
  itemMap?: KV<any>[];
  formatter?: (value: number, name: string) => string[];
  excludedFromTotal?: string[];
  selectionLabel?: string;
  noTotal?: boolean;
  title?: string;
};

export type MyCircleChartProps<T extends Record<string, any>> = {
  data: T[];
  traceKey: keyof T;
  nameKey: keyof T;
  dataKey: keyof T;
  width?: string | number;
  height?: string | number;
  colors?: string[];
  itemMap?: KV<any>[];
  formatter?: (value: number, name: string) => string[];
  selectionLabel?: string;
  title?: string;
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
function interpolateNulls(data: (number | null)[]): number[] {
  const result = [...data];

  for (let i = 0; i < result.length; i++) {
    if (result[i] === null) {
      // Look for previous and next non-null
      let prev = i - 1;
      while (prev >= 0 && result[prev] === null) prev--;

      let next = i + 1;
      while (next < result.length && result[next] === null) next++;

      if (prev >= 0 && next < result.length) {
        result[i] = ((result[prev] as number) + (result[next] as number)) / 2;
      } else if (prev >= 0) {
        result[i] = result[prev];
      } else if (next < result.length) {
        result[i] = result[next];
      } else {
        result[i] = 0; // fallback if all null
      }
    }
  }

  return result as number[];
}

export function transformForTrendChart<T extends Record<string, any>>(
  data: T[],
  traceKey: keyof T,
  xAxis: keyof T,
  yAxis: keyof T,
  totalTitle: string,
  excludedFromTotal?: string[],
  noTotal?: boolean
) {
  const grouped: Record<string, Record<string, number>> = {};
  const traces: Set<string> = new Set();

  data.forEach((item) => {
    const x = String(item[xAxis]);
    const trace = String(item[traceKey]);
    const y = item[yAxis];

    if (!grouped[x]) grouped[x] = {};

    grouped[x][trace] = y;

    if (!excludedFromTotal?.includes(trace)) traces.add(trace);
  });

  const traceList = Array.from(traces);

  traces.forEach((trace) => {
    const entries = Object.entries(grouped).sort(([a], [b]) =>
      a.localeCompare(b)
    );

    const values = entries.map(([_, val]) => val[trace] ?? null);

    const interpolated = interpolateNulls(values);

    interpolated.forEach((val, i) => {
      const [x] = entries[i];
      grouped[x][trace] = val;
    });
  });

  const labels = Object.keys(grouped).sort();

  if (!noTotal) {
    labels.forEach((label) => {
      const values = grouped[label];
      const total = Object.entries(values).reduce((sum, [key, val]) => {
        if (excludedFromTotal?.includes(key)) return sum;
        return sum + (typeof val === "number" ? val : 0);
      }, 0);
      grouped[label][totalTitle] = total;
    });
  }

  if (!noTotal) {
    traceList.unshift(totalTitle);
  }

  const datasets = traceList.map((trace, ind) => ({
    data: labels.map((label) => grouped[label]?.[trace] ?? null),
    color: () => COLORS[ind % COLORS.length],
  }));

  const result: LineChartData = {
    labels,
    datasets,
    legend: traceList,
  };

  return { transformedData: result, legend: traceList };
}

export function filterChartDataByFields(
  data: LineChartData,
  shownFields: string[]
): LineChartData {
  if (!data.legend || !data.datasets) return data;

  const filteredLegend: string[] = [];
  const filteredDatasets: typeof data.datasets = [];

  data.legend.forEach((label, index) => {
    if (shownFields.includes(label)) {
      filteredLegend.push(label);
      filteredDatasets.push(data.datasets[index]);
    }
  });

  return {
    ...data,
    legend: filteredLegend,
    datasets: filteredDatasets,
  };
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
  "#4DD0E1", // soft teal
  "#A1887F", // soft brown
  "#90CAF9", // lighter blue
  "#F06292", // soft pink
  "#9575CD", // soft violet
  "#FFF176", // soft lemon
  "#4DB6AC", // aqua green
  "#F48FB1", // baby pink
];

export const useTrendChart = <T extends Record<string, any>>(
  data: T[],
  traceKey: keyof T,
  xKey: keyof T,
  yKey: keyof T,
  itemMap?: KV<any>[],
  excludedFromTotal?: string[],
  noTotal?: boolean
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
          camelCaseToWords(yKey as string) ??
          s[traceKey],
  }));

  const totalTitle = `Total${
    excludedFromTotal && excludedFromTotal.length > 0
      ? " excl. " + excludedFromTotal.join(", ")
      : ""
  }`;

  const { transformedData, legend } = transformForTrendChart(
    resolvedData,
    traceKey,
    xKey,
    yKey,
    totalTitle,
    excludedFromTotal,
    noTotal
  );

  useEffect(() => {
    setShownFields(noTotal ? [...legend] : [totalTitle]);
  }, [legend.length, noTotal, totalTitle]);

  return { allTraceKeys: legend, transformedData, shownFields, setShownFields };
};

export const useCircleChart = <T extends Record<string, any>>(
  data: T[],
  nameKey: keyof T,
  dataKey: keyof T,
  traceKey: keyof T,
  itemMap?: KV<any>[]
) => {
  const [selectedField, setSelectedField] = useState(-1);

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
  const resolvedData = cleanedData
    .filter((s) => s[traceKey] === selectedField)
    .map((s) => ({
      [nameKey]:
        kv?.label === ""
          ? kv.values.find((_, i) => i === s[nameKey])
          : kv?.values.find((v) => v.id === s[nameKey])?.[kv.label] ??
            "—" ??
            s[nameKey],
      [dataKey]: s[dataKey],
      [traceKey]: s[traceKey],
    }));

  useEffect(() => {
    if (cleanedData.length > 0) {
      setSelectedField(cleanedData[0][traceKey]);
    }
  }, [cleanedData]);

  return { resolvedData, selectedField, setSelectedField };
};
