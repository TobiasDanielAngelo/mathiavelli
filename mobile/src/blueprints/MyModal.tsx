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
    <Overlay
      isVisible={isVisible}
      style={{
        transform: [{ translateX: -500 }],
        position: "absolute",
      }}
      statusBarTranslucent
      navigationBarTranslucent
      onBackdropPress={() => setVisible(false)}
      supportedOrientations={["portrait", "landscape"]}
    >
      <View
        style={{
          justifyContent: "space-between",
          backgroundColor: "white",
          borderRadius: 10,
          width: 300,
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
    margin: "auto",
    justifyContent: "center",
    alignItems: "center",
    // padding: winHeight * 0.03,
  },
});
