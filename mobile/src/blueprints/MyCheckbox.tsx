import { StyleSheet, Text, View } from "react-native";
import { CheckBox } from "react-native-elements";
import { winWidth } from "../constants/constants";

export const MyCheckBox = (props: {
  hidden?: boolean;
  label?: string;
  value?: boolean;
  onChangeValue?: (val: boolean) => void;
  msg?: string;
}) => {
  const { hidden, value, onChangeValue, label } = props;

  return (
    !hidden && (
      <View style={styles.main}>
        <Text>{label}</Text>
        <CheckBox
          checked={value}
          style={styles.checkbox}
          onPress={() => onChangeValue?.(!value)}
          containerStyle={[styles.container]}
          checkedColor="teal"
        />
      </View>
    )
  );
};
const styles = StyleSheet.create({
  checkbox: {
    alignSelf: "center",
  },
  main: {
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    margin: 0,
    padding: 0,
    justifyContent: "center",
    flexDirection: "column",
  },
});
