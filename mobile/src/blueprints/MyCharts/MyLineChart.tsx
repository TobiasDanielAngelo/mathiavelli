import { useState } from "react";
import {
  Dimensions,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { LineChartData } from "react-native-chart-kit/dist/line-chart/LineChart";
import { winWidth } from "../../constants/constants";
import { Text } from "react-native";
import {
  COLORS,
  filterChartDataByFields,
  MyTrendChartProps,
  useTrendChart,
} from ".";
import { observer } from "mobx-react-lite";
import { MyMultiDropdownSelector } from "../MyMultiDropdownSelector";

const defaultDatePrice = {
  label: "",
  price: -1,
};

export const MyLineChart = observer(
  <T extends Record<string, any>>({
    data,
    traceKey,
    xKey,
    yKey,
    yPrefix,
    ySuffix,
    itemMap,
    formatter,
    excludedFromTotal,
    selectionLabel,
    noTotal,
    title = "",
  }: MyTrendChartProps<T>) => {
    const [dataPoint, setDataPoint] = useState(defaultDatePrice);
    const { width, height } = useWindowDimensions();
    const isPortrait = height >= width || (height < width && height < 600);
    const ratio = 0.7;
    const chartWidth = isPortrait ? 0.93 * width : (1 / (ratio + 1.1)) * width;

    const { allTraceKeys, transformedData, shownFields, setShownFields } =
      useTrendChart(
        data,
        traceKey ?? "",
        xKey,
        yKey,
        itemMap,
        excludedFromTotal,
        noTotal
      );

    const filteredData = filterChartDataByFields(transformedData, shownFields);

    return !filteredData.datasets.map((s) => s.data).length ? (
      <></>
    ) : (
      <View>
        <MyMultiDropdownSelector
          value={shownFields}
          onChangeValue={(t) => setShownFields(t as string[])}
          options={allTraceKeys.map((s) => ({ id: s, name: s }))}
          label={selectionLabel ?? "Items"}
          isAll
        />
        <LineChart
          onDataPointClick={({ value, dataset, getColor, index }) => {
            // do something like show tooltip or alert
            console.log(`Clicked value: ${value} at index ${index}`);
          }}
          data={filteredData}
          width={chartWidth} // from react-native
          height={height * 0.45}
          yAxisLabel={yPrefix}
          yAxisSuffix={ySuffix}
          yAxisInterval={1} // optional, defaults to 1
          chartConfig={{
            backgroundGradientFrom: "teal",
            backgroundGradientTo: "teal",
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
          verticalLabelRotation={-45}
          xLabelsOffset={20}
          style={{
            marginVertical: 8,
            borderRadius: 16,
            padding: 20,
          }}
        />
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {filteredData.legend?.map((label, index) => (
            <View
              key={index}
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
                  backgroundColor: COLORS[index % COLORS.length],
                  borderRadius: 6,
                }}
              />
              <Text style={{ fontSize: 12, marginTop: 4 }}>{label}</Text>
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
