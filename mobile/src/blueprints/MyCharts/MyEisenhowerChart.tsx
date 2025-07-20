import React from "react";
import { useWindowDimensions, View } from "react-native";
import Svg, { Line, Text as SVGText } from "react-native-svg";
import { useVisible } from "../../constants/hooks";
import { MyModal } from "../MyModal";
import { Text } from "react-native";

interface EisenhowerChartProps<T> {
  items: T[];
  width?: number;
  height?: number;
  xKey?: keyof T;
  yKey?: keyof T;
  label?: (keyof T)[];
  xRange?: [number, number];
  yRange?: [number, number];
}

const normalize = (v: number, min: number, max: number) => {
  if (min === max) return 100;
  return ((v - min) / (max - min)) * 100;
};

const Point = (props: {
  normX: number;
  normY: number;
  urgency: number;
  importance: number;
  modalContent: React.ReactNode;
}) => {
  const { normX, normY, urgency, importance, modalContent } = props;
  const { isVisible1, setVisible1 } = useVisible();
  return (
    <>
      <MyModal isVisible={isVisible1} setVisible={setVisible1}>
        {modalContent}
      </MyModal>
      <SVGText
        x={normX}
        y={normY}
        fontSize="50"
        textAnchor="middle"
        onPress={() => setVisible1(true)}
        stroke="yellow"
        fill="yellow"
      >
        •
        <SVGText
          x={normX}
          y={normY + 5}
          fontSize="10"
          stroke="black"
        >{`(${urgency}, ${importance})`}</SVGText>
      </SVGText>
    </>
  );
};

export const MyEisenhowerChart = <T extends Record<string, any>>({
  items,
  xKey = "x",
  yKey = "y",
  label = ["label"],
  xRange,
  yRange,
}: EisenhowerChartProps<T>) => {
  const { width, height } = useWindowDimensions();
  const isPortrait = height >= width || (height < width && height < 600);
  const ratio = 0.7;
  const chartWidth = isPortrait ? 0.93 * width : (1 / (ratio + 1.1)) * width;
  const chartHeight = 0.6 * height;
  const getRange = (key: keyof T): [number, number] => {
    const values = items.map((d) => d[key] as number);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return [min, max];
  };

  const padding = 10;

  const computedXRange = xRange ?? getRange(xKey);
  const computedYRange = yRange ?? getRange(yKey);

  const getNormValues = (point: T) => {
    const x = point[xKey] as number;
    const y = point[yKey] as number;

    const pad = 3 * padding;
    const usableWidth = chartWidth - 2 * pad;
    const usableHeight = chartHeight - 2 * pad;

    const normX =
      pad +
      (normalize(x, computedXRange[0], computedXRange[1]) * usableWidth) / 100;

    const normY =
      pad +
      ((100 - normalize(y, computedYRange[0], computedYRange[1])) *
        usableHeight) /
        100;

    const urgency =
      Math.round(10 * normalize(x, computedXRange[0], computedXRange[1])) / 10;
    const importance =
      Math.round(10 * normalize(y, computedYRange[0], computedYRange[1])) / 10;

    return { normX, normY, urgency, importance };
  };

  return (
    <View>
      <Svg width={chartWidth} height={chartHeight}>
        <Line
          x1={chartWidth / 2}
          y1={padding}
          x2={chartWidth / 2}
          y2={chartHeight - padding}
          stroke="#aaa"
        />
        <Line
          x1={padding}
          y1={chartHeight / 2}
          x2={chartWidth - padding}
          y2={chartHeight / 2}
          stroke="#aaa"
        />
        {items.map((point, i) => {
          const values = getNormValues(point);
          return (
            <Point
              {...values}
              key={i}
              modalContent={
                <Text>{label.map((s) => String(point[s])).join(" - ")}</Text>
              }
            />
          );
        })}
      </Svg>
    </View>
  );
};
