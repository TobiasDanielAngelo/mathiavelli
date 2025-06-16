import { observer } from "mobx-react-lite";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { MyCircleChartProps, useCircleChart } from ".";
import { getFirstWords } from "../../constants/helpers";
import { MyCustomTooltip } from "./MyCustomToolTip";

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
 * - dataKey: key to extract slice size, i.e. value
 * - nameKey: label to show, i.e. name
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
  }: MyCircleChartProps<T>) => {
    const { resolvedData } = useCircleChart(data, nameKey, dataKey, itemMap);
    return (
      <div className="w-full h-full">
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
              innerRadius={"30%"}
              fill="#8884d8"
              label={({ percent, name }) =>
                percent > 0.01
                  ? `${getFirstWords(String(name))}\n${(percent * 100).toFixed(
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
      </div>
    );
  }
);
