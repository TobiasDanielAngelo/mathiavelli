import { observer } from "mobx-react-lite";
import { useState } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import {
  COLORS,
  filterChartDataByFields,
  MyCircleChartProps,
  MyTrendChartProps,
  useCircleChart,
  useTrendChart,
} from ".";
import { MyMultiDropdownSelector } from "../MyMultiDropdownSelector";
import { MyDropdownSelector } from "../MyDropdownSelector";
import { formatValue } from "../../constants/JSXHelpers";
import { mySum } from "../../constants/helpers";

const data = [
  {
    name: "Seoul",
    population: 21500000,
    color: "rgba(131, 167, 234, 1)",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15,
  },
  {
    name: "Toronto",
    population: 2800000,
    color: "#F00",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15,
  },
  {
    name: "Beijing",
    population: 527612,
    color: "red",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15,
  },
  {
    name: "New York",
    population: 8538000,
    color: "#ffffff",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15,
  },
  {
    name: "Moscow",
    population: 11920000,
    color: "rgb(0, 0, 255)",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15,
  },
];

export const MyPieChart = observer(
  <T extends Record<string, any>>({
    data,
    colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"],
    dataKey,
    nameKey,
    traceKey,
    itemMap,
    formatter,
    selectionLabel,
    title = "",
  }: MyCircleChartProps<T>) => {
    const { width, height } = useWindowDimensions();
    const isPortrait = height >= width || (height < width && height < 600);
    const ratio = 0.5;
    const chartWidth = isPortrait ? 0.93 * width : (1 / (ratio + 1.1)) * width;

    const { selectedField, setSelectedField, resolvedData } = useCircleChart(
      data,
      nameKey,
      dataKey,
      traceKey,
      itemMap
    );

    return (
      <View>
        <MyDropdownSelector
          value={selectedField}
          onChangeValue={setSelectedField}
          options={Array.from(
            new Set(data.map((s) => s[traceKey as string]))
          ).map((s) => ({
            id: s,
            name: formatValue(
              s,
              traceKey as string,
              [],
              itemMap?.find((s) => s.key === traceKey)
            ),
          }))}
          label={selectionLabel ?? "Traces"}
        />
        <PieChart
          data={resolvedData}
          width={width}
          height={0.5 * height}
          accessor={dataKey as string}
          backgroundColor="transparent"
          paddingLeft={isPortrait ? "150" : "0"}
          hasLegend={false}
          chartConfig={{
            backgroundGradientFrom: "transparent",
            backgroundGradientTo: "white",
            decimalPlaces: 2, // optional, defaults to 2dp
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
            },
          }}
        />
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
          }}
        >
          {resolvedData.map((s, ind, arr) => (
            <View
              key={ind}
              style={{
                alignItems: "center",
                marginHorizontal: 8,
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: COLORS[ind % COLORS.length],
                  borderRadius: 6,
                }}
              />
              <Text style={{ fontSize: 12, marginTop: 4 }}>
                {s[nameKey as string]}
              </Text>
              <Text style={{ fontSize: 12, marginTop: 4 }}>
                {Math.round(
                  (s[dataKey as string] /
                    mySum(arr.map((t) => t[dataKey as string]))) *
                    1000
                ) / 10}
                %
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  bar: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
