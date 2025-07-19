import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import moment from "moment";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { winWidth } from "../constants/constants";
import { MyIcon } from "./MyIcon";
import { isValidDate } from "rrule/dist/esm/dateutil";

export const MyDateTimePicker = (props: {
  hidden?: boolean;
  value: string;
  label?: string;
  onChangeValue: (t: string) => void;
  isDateOnly?: boolean;
  isTimeOnly?: boolean;
  dateFormat?: string;
  msg?: string;
}) => {
  const { hidden, onChangeValue, value, isDateOnly, isTimeOnly, label } = props;
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onChangeDate = useCallback((event: DateTimePickerEvent, date: Date) => {
    if (event.type == "set") {
      onChangeValue(date.toISOString());
    }
    setShowDatePicker(false);
    !isDateOnly && setShowTimePicker(true);
  }, []);

  const onChangeTime = useCallback((event: DateTimePickerEvent, date: Date) => {
    if (event.type == "set") {
      onChangeValue(date.toISOString());
    }
    setShowTimePicker(false);
  }, []);

  const datePart =
    value !== "" && value
      ? moment(value, "MMM D, YYYY").format("MMM D, YYYY")
      : "N/D";
  const timePart =
    value !== "" && value ? moment(value).format("hh:mm A") : "N/T";
  const calendarLabel = isDateOnly
    ? datePart
    : isTimeOnly
    ? timePart
    : `${datePart} ${timePart}`;

  return (
    !hidden && (
      <View style={styles.main}>
        <Text>{label}</Text>
        <MyIcon
          icon="calendar"
          onPress={() =>
            isTimeOnly ? setShowTimePicker(true) : setShowDatePicker(true)
          }
          label={calendarLabel}
        />

        {showDatePicker && (
          <DateTimePicker
            mode="date"
            display="calendar"
            value={moment(value).toDate()}
            onChange={(e, date) => onChangeDate(e, date ?? new Date())}
          />
        )}
        {showTimePicker && (
          <DateTimePicker
            mode="time"
            value={moment(value).toDate()}
            onChange={(e, date) => onChangeTime(e, date ?? new Date())}
          />
        )}
      </View>
    )
  );
};

const styles = StyleSheet.create({
  main: {
    margin: 5,
  },
  text: {
    color: "teal",
    marginHorizontal: 5,
  },
  bar: {
    flexDirection: "row",
  },
});
