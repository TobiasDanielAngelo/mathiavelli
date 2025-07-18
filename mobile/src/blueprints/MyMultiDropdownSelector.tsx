import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { winWidth } from "../constants/constants";
import { Option, StateSetter } from "../constants/interfaces";

export const MyMultiDropdownSelector = (props: {
  label?: string;
  value: (number | string)[];
  onChangeValue: StateSetter<(number | string)[]>;
  options?: Option[];
  msg?: string;
  relative?: boolean;
  open?: boolean;
  maxSelections?: number;
  isAll?: boolean;
  flex?: boolean;
  disabled?: boolean;
  hidden?: boolean;
}) => {
  const { options, value, onChangeValue, label, flex, hidden, disabled } =
    props;

  const [open, setOpen] = useState(false);

  return (
    !hidden && (
      <View style={[styles.main, { flex: flex ? 1 : 0 }]}>
        <Text>{label}</Text>
        <DropDownPicker
          items={
            options?.map((t) => ({
              label: t.name,
              value: t.id,
            })) ?? []
          }
          multiple={true}
          setValue={onChangeValue}
          value={value}
          open={open}
          setOpen={setOpen}
          // textStyle={{
          //   fontSize: (1 / 20) * winWidth,
          // }}
          searchable={true}
          searchPlaceholder="Search..."
          listMode="MODAL"
          disabled={disabled}
          placeholder={label}
        />
        {/* <MyQuickList
          values={values}
          items={items}
          setValues={setValues}
          hidden={values.length === 0}
          editable
        /> */}
      </View>
    )
  );
};

const styles = StyleSheet.create({
  main: {
    margin: 3,
  },
  list: {
    margin: 5,
    padding: 5,
    flexDirection: "row",
    backgroundColor: "lightblue",
    flexWrap: "wrap",
    borderRadius: 20,
  },
  item: {
    backgroundColor: "lightcyan",
    borderRadius: 20,
    padding: 5,
    margin: 5,
  },
  text: { fontSize: 0.04 * winWidth },
});
