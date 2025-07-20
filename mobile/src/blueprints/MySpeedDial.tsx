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
      icon={{
        name: leftSide ? "sliders-h" : "pen",
        color: "#fff",
        type: "font-awesome-5",
      }}
      openIcon={{ name: "close", color: "#fff" }}
      onOpen={() => setOpen(!open)}
      onClose={() => setOpen(!open)}
      placement={leftSide ? "left" : "right"}
      color="teal"
      buttonStyle={{
        borderRadius: 100,
      }}
    >
      {actions?.map((s, ind) => (
        <SpeedDial.Action
          icon={{ name: s.icon, color: "#fff", type: "font-awesome-5" }}
          title={s.name}
          onPress={s.onPress}
          key={ind}
          style={{ top: -70, right: 0 }}
          titleStyle={{ top: -70, right: 0 }}
          color="teal"
          buttonStyle={{
            borderRadius: 100,
          }}
        />
      ))}
    </SpeedDial>
  );
};

const styles = StyleSheet.create({});
