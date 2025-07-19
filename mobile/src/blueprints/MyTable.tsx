import React from "react";
import { View, StyleSheet, Text, FlatList, ScrollView } from "react-native";
import { DataTable } from "react-native-paper";
import { winWidth } from "../constants/constants";

function getColumnWidths(matrix: any[][]): number[] {
  const colCount = matrix[0]?.length || 0;
  const widths: number[] = Array(colCount).fill(0);

  for (let col = 0; col < colCount; col++) {
    let maxLen = 0;

    for (let row = 0; row < matrix.length; row++) {
      const cell = matrix[row][col] ?? "";
      if (typeof cell === "string") {
        const firstLine = cell.split("\n")[0];
        maxLen = Math.max(maxLen, firstLine.length);
      }
    }

    widths[col] = Math.max(maxLen * 8 + 16, 100); // estimate width
  }

  return widths;
}

export const MyTable = (props: {
  matrix: React.ReactNode[][];
  hidden?: boolean;
}) => {
  const { matrix, hidden } = props;

  const colWidths = getColumnWidths(matrix);

  return hidden ? (
    <></>
  ) : matrix.length < 2 ? (
    <Text>No entries.</Text>
  ) : (
    <ScrollView style={styles.container} horizontal>
      <DataTable>
        <DataTable.Header>
          {matrix[0].map((s, ind) => (
            <DataTable.Title key={ind} style={{ width: colWidths[ind] }}>
              {s}
            </DataTable.Title>
          ))}
        </DataTable.Header>
        <FlatList
          data={matrix.slice(1)}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item: s }) => (
            <DataTable.Row style={styles.row}>
              <DataTable.Cell style={{ width: colWidths[0] }}>
                {s[0]}
              </DataTable.Cell>
              {s.slice(1).map((t, ind) => (
                <DataTable.Cell key={ind} style={{ width: colWidths[ind + 1] }}>
                  {t}
                </DataTable.Cell>
              ))}
            </DataTable.Row>
          )}
        />
      </DataTable>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    margin: "auto",
  },
  row: { height: 40 },
});
