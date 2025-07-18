import { useState } from "react";
import { SpeedDial } from "react-native-elements";
import { MySpeedDialProps } from "../constants/interfaces";
import { View, StyleSheet } from "react-native";

export const MySpeedDial = (props: {
  actions?: MySpeedDialProps[];
  leftSide?: boolean;
}) => {
  const { actions, leftSide } = props;
  const [open, setOpen] = useState(false);

  return (
    <SpeedDial
      isOpen={open}
      icon={{ name: "edit", color: "#fff" }}
      openIcon={{ name: "close", color: "#fff" }}
      onOpen={() => setOpen(!open)}
      onClose={() => setOpen(!open)}
      placement={leftSide ? "left" : "right"}
    >
      {actions?.map((s, ind) => (
        <SpeedDial.Action
          icon={{ name: "star", color: "#fff" }}
          title={s.name}
          onPress={s.onPress}
          key={ind}
          style={{ top: -70, right: 0 }}
          titleStyle={{ top: -70, right: 0 }}
        />
      ))}
    </SpeedDial>
  );
};

const styles = StyleSheet.create({});
