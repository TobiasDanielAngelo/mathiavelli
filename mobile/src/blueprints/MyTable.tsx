import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { DataTable } from "react-native-paper";

export const MyTable = (props: {
  matrix: React.ReactNode[][];
  hidden?: boolean;
}) => {
  const { matrix, hidden } = props;

  return hidden ? (
    <></>
  ) : matrix.length < 2 ? (
    <Text>No entries.</Text>
  ) : (
    <View style={styles.container}>
      <DataTable>
        <DataTable.Header style={styles.head}>
          {matrix[0].map((s, ind) => (
            <DataTable.Title key={ind}>{s}</DataTable.Title>
          ))}
        </DataTable.Header>
        {matrix.slice(1).map((s, ind) => (
          <DataTable.Row style={styles.row} key={ind}>
            <DataTable.Cell>{s[0]}</DataTable.Cell>
            {s.slice(1).map((t, ind) => (
              <DataTable.Cell key={ind}>{t}</DataTable.Cell>
            ))}
          </DataTable.Row>
        ))}
      </DataTable>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  head: { height: 50 },
  row: { height: 40 },
});
