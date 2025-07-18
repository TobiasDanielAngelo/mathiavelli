import React from "react";
import {
  View,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
  DimensionValue,
} from "react-native";
import { winHeight } from "../constants/constants";

interface SideBySideViewProps {
  SideA?: React.ReactNode;
  SideB?: React.ReactNode;
  ratio?: number;
  reversed?: boolean;
}

export const SideBySideView = ({
  SideA,
  SideB,
  ratio = 1,
  reversed = false,
}: SideBySideViewProps) => {
  const { width } = useWindowDimensions();
  const isLarge = width >= 900;
  const total = ratio + 1;
  const widthA = `${(ratio / total) * 100}%` as DimensionValue;
  const widthB = `${(1 / total) * 100}%` as DimensionValue;

  const containerStyle = {
    flexDirection: (isLarge ? (reversed ? "row-reverse" : "row") : "column") as
      | "row-reverse"
      | "row"
      | "column"
      | "column-reverse",
  };

  return (
    <View style={styles.outer}>
      <View style={[styles.inner, containerStyle]}>
        {SideA && (
          <View
            style={[
              styles.panel,
              {
                width: isLarge ? widthA : "100%",
              },
            ]}
            // contentContainerStyle={styles.scrollContent}
          >
            {SideA}
          </View>
        )}

        {SideB && (
          <View
            style={[
              styles.panel,
              styles.sideB,
              {
                width: isLarge ? widthB : "100%",
              },
            ]}
          >
            {SideB}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
  panel: {},
  sideB: {},
  scrollContent: {},
});
