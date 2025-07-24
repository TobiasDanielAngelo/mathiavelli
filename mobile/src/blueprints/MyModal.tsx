import { PropsWithChildren, useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const { isVisible, setVisible, children, title, subTitle } = props;
  const { width, height } = useWindowDimensions();

  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  return (
    <Animated.View
      style={{
        position: "absolute",
        opacity: opacity,
        width: width - insets.right,
        height: height,
        top: 0,
        backgroundColor: "rgba(100,100,100,0.1)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 100,
        display: isVisible ? "flex" : "none",
        padding: 10,
      }}
    >
      <Pressable
        style={{
          flex: 1,
          position: "absolute",
          backgroundColor: "rgba(100,100,100,0.5)",
          width: width,
          height: height,
        }}
        onPress={() => setVisible(false)}
      ></Pressable>
      <View
        style={{
          position: "absolute",
          minHeight: "40%",
          marginHorizontal: "auto",
          marginBottom: 30,
          padding: 15,
          justifyContent: "space-between",
          backgroundColor: "white",
          borderRadius: 10,
          minWidth: 300,
          width: width * 0.5,
          maxWidth: 400,
          maxHeight: height * 0.7,
        }}
      >
        <ScrollView keyboardShouldPersistTaps="always">
          <HView>
            <Text style={styles.text}>{title}</Text>
            <Text style={styles.text}>{subTitle}</Text>
            <MyIcon icon="times" onPress={() => setVisible(false)} />
          </HView>
          <View style={styles.children}>{children}</View>
        </ScrollView>
      </View>
    </Animated.View>
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
