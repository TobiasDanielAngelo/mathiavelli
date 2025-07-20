import { PropsWithChildren } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Overlay } from "react-native-elements";
import { StateSetter } from "../constants/interfaces";
import { HView } from "./HView";
import { MyIcon } from "./MyIcon";

export const MyModal = (
  props: PropsWithChildren<{
    isVisible: boolean;
    setVisible: StateSetter<boolean>;
    fullWidth?: boolean;
    title?: string;
    subTitle?: string;
    disableClose?: boolean;
  }>
) => {
  const { width, height } = useWindowDimensions();
  const {
    isVisible,
    setVisible,
    children,
    fullWidth,
    title,
    subTitle,
    disableClose,
  } = props;

  return (
    <Overlay isVisible={isVisible}>
      <View
        style={{
          minWidth: 100,
          width: width * 0.5,
          maxWidth: 400,
          maxHeight: height * 0.7,
        }}
      >
        <ScrollView>
          <HView>
            <Text style={styles.text}>{title}</Text>
            <Text style={styles.text}>{subTitle}</Text>
            <MyIcon icon="times" onPress={() => setVisible(false)} />
          </HView>
          <View style={styles.children}>{children}</View>
          <View style={styles.bar}>
            <MyIcon icon="check" onPress={() => setVisible(false)} />
          </View>
        </ScrollView>
      </View>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  text: {},
  bar: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  children: {
    flex: 1,
    // padding: winHeight * 0.03,
  },
});
