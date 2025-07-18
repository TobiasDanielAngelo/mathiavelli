import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Icon } from "react-native-elements";

// 1. Map icons to names
const iconMap = {} as const;

// 2. Derive type from keys
export type IconName = keyof typeof iconMap;

// 3. Props with generic icon component + standard icon props
interface MyIconProps {
  icon: string;
  label?: string;
  hidden?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}

export const MyIcon: React.FC<MyIconProps> = ({
  icon,
  label,
  hidden,
  disabled,
  onPress,
  onLongPress,
}) => {
  return (
    !hidden && (
      <TouchableOpacity
        style={styles.main}
        onPress={!disabled ? onPress : undefined}
        onLongPress={!disabled ? onLongPress : undefined}
      >
        <Icon name={icon} type="font-awesome" />
        {label && <Text style={styles.text}>{label}</Text>}
      </TouchableOpacity>
    )
  );
};

const styles = StyleSheet.create({
  main: {
    alignItems: "center",
  },
  text: {
    color: "teal",
  },
});
