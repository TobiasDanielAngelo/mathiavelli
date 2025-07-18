import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import DropDownPicker, {
  ItemType,
  ValueType,
} from "react-native-dropdown-picker";
import { winWidth } from "../constants/constants";
import { Option } from "../constants/interfaces";

export const MyDropdownSelector = (props: {
  options?: Option[];
  value?: number;
  onChangeValue: (t: number) => void;
  msg?: string;
  label?: string;
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
        {label && <Text>{label}</Text>}
        <DropDownPicker
          items={
            options?.map((t) => ({
              label: t.name,
              value: t.id,
            })) ?? []
          }
          multiple={false}
          setValue={(t: any) => onChangeValue(t())}
          value={value ?? -1}
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
      </View>
    )
  );
};

const styles = StyleSheet.create({
  main: {
    margin: 3,
  },
});
