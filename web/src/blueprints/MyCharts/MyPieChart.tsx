import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { getFirstWords, getStoreSignature } from "../../constants/helpers";
import { KV } from "../ItemDetails";
import { MyCustomTooltip } from "./MyCustomToolTip";

type MyPieChartProps<T extends Record<string, any>> = {
  data: T[];
  nameKey: keyof T;
  dataKey: keyof T;
  width?: string | number;
  height?: string | number;
  colors?: string[];
  itemMap?: KV<any>[];
  formatter?: (value: number, name: string) => string[];
};

/**
 * PieChart Component
 *
 * Shows part-to-whole relationships (e.g., budget allocation).
 *
 * Data shape:
 * [
 *   { name: string; value: number },
 *   ...
 * ]
 *
 * Props:
 * - data: list of segments
 * - dataKey: key to extract slice size
 * - nameKey: label to show
 *
 * Best for:
 * - Distribution breakdowns
 */
export const MyPieChart = observer(
  <T extends Record<string, any>>({
    data,
    width = "100%",
    height = "100%",
    colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"],
    dataKey,
    nameKey,
    itemMap,
    formatter,
  }: MyPieChartProps<T>) => {
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
      ...s,
      [nameKey]:
        kv?.label === ""
          ? kv.values.find((_, i) => i === s[nameKey])
          : kv?.values.find((v) => v.id === s[nameKey])?.[kv.label] ??
            "—" ??
            s[nameKey],
    }));

    return !resolvedData.length ? (
      <></>
    ) : (
      <ResponsiveContainer width={width} height={height}>
        <PieChart>
          <Tooltip content={<MyCustomTooltip />} formatter={formatter} />
          <Pie
            data={resolvedData}
            nameKey={nameKey as string}
            dataKey={dataKey as string}
            cx="50%"
            cy="50%"
            outerRadius={"60%"}
            fill="#8884d8"
            label={({ percent, name }) =>
              percent > 0.01
                ? `${getFirstWords(String(name))} ${(percent * 100).toFixed(
                    1
                  )}%`
                : ""
            }
            labelLine={() => <></>}
          >
            {resolvedData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    );
  }
);
