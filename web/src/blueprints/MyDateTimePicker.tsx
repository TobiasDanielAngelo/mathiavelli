import Datetime from "react-datetime";
import "../react-datetime.css";

export const MyDateTimePicker = (props: {
  value: string;
  label?: string;
  onChangeValue: (t: string) => void;
  isDateOnly?: boolean;
  isTimeOnly?: boolean;
  dateFormat?: string;
  msg?: string;
}) => {
  const {
    value,
    onChangeValue,
    isDateOnly,
    isTimeOnly,
    label,
    dateFormat,
    msg,
  } = props;

  return (
    <div>
      <label className="text-xs text-blue-600">
        {label ??
          `Select${!isTimeOnly ? " Date" : ""}${
            !isDateOnly && !isTimeOnly ? "/" : " "
          }${!isDateOnly ? "Time" : ""}`}
      </label>
      <Datetime
        value={value}
        onChange={(d) => onChangeValue(d as string)}
        dateFormat={isTimeOnly ? false : dateFormat ?? "MMM D YYYY"}
        timeFormat={isDateOnly ? false : "h:mm A"}
        // utc={true}
        inputProps={{
          placeholder: `Select${!isTimeOnly ? " Date" : ""}${
            !isDateOnly && !isTimeOnly ? "/" : " "
          }${!isDateOnly ? "Time" : ""}`,
          className:
            "block pb-2.5 px-0 w-full text-center text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer",
        }}
      />
      <label className="block text-xs font-medium dark:text-white mb-3 text-red-600">
        {msg}
      </label>
    </div>
  );
};
