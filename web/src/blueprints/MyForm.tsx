import DeleteIcon from "@mui/icons-material/Delete";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { daysOfWeek } from "../constants/constants";
import { toOptions } from "../constants/helpers";
import { Field } from "../constants/interfaces";
import { MyButton } from "./MyButton";
import { MyConfirmModal } from "./MyConfirmModal";
import { MyDateTimePicker } from "./MyDateTimePicker";
import { MyDropdownSelector } from "./MyDropdownSelector";
import { MyImageUploader } from "./MyImageUploader";
import { MyInput } from "./MyInput";
import { MyMultiSelector } from "./MyMultiSelector";
import { useKeyPress } from "../constants/hooks";
import { MyTextArea } from "./MyTextArea";

export const MyForm = observer(
  (props: {
    fields: (Field | undefined)[][];
    title: string;
    objectName?: string;
    details: any;
    setDetails: (t: any) => void;
    onClickSubmit: () => void;
    hasDelete?: boolean;
    onDelete?: () => Promise<void>;
    msg?: Object;
    isLoading?: boolean;
  }) => {
    const {
      title,
      fields,
      details,
      objectName,
      setDetails,
      onClickSubmit,
      hasDelete,
      onDelete,
      msg,
      isLoading,
    } = props;

    useKeyPress(["Enter"], onClickSubmit);

    const [isVisible1, setVisible1] = useState(false);

    const onChangeValue = (
      t: string | number | File | number[],
      name: string
    ) => {
      setDetails({ ...details, [name]: t });
    };

    const onClickDelete = async () => {
      setVisible1(true);
    };

    const onClickConfirm = async () => {
      onDelete && (await onDelete());
    };

    return (
      <div className="max-w-md mx-auto p-10 dark:bg-gray-900">
        <MyConfirmModal
          isVisible={isVisible1}
          setVisible={setVisible1}
          onClickCheck={onClickConfirm}
          objectName={objectName}
          actionName="Delete"
        />
        <h1 className="text-xl mb-2 font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
          {title}
        </h1>
        {fields.map((s, ind) => (
          <div className={`grid md:grid-cols-${s.length} md:gap-6`} key={ind}>
            {s.map((t, ind) =>
              !t ? (
                <div key={ind}></div>
              ) : t.type === "password" ? (
                <div key={ind}>
                  <MyInput
                    label={t.label}
                    value={details[t.name]}
                    onChangeValue={(u) => onChangeValue(u, t.name)}
                    isPassword
                    key={ind}
                    msg={
                      msg &&
                      !`${msg[t.name as keyof Object]}`.includes("undefined")
                        ? `${msg[t.name as keyof Object]}`
                        : ""
                    }
                  />
                </div>
              ) : t.type === "select" ? (
                <MyDropdownSelector
                  label={t.label}
                  options={t.options}
                  value={details[t.name]}
                  msg={
                    msg &&
                    !`${msg[t.name as keyof Object]}`.includes("undefined")
                      ? !`${msg[t.name as keyof Object]}`.includes("Invalid pk")
                        ? `${msg[t.name as keyof Object]}`
                        : "Select one that applies"
                      : ""
                  }
                  onChangeValue={(u) => onChangeValue(u, t.name)}
                  key={ind}
                />
              ) : ["date", "time", "datetime", "month"].includes(t.type) ? (
                <MyDateTimePicker
                  value={details[t.name]}
                  label={t.label}
                  isDateOnly={t.type === "date" || t.type === "month"}
                  dateFormat={t.type === "month" ? "MMM YYYY" : undefined}
                  isTimeOnly={t.type === "time"}
                  onChangeValue={(u) => onChangeValue(u, t.name)}
                  msg={
                    msg &&
                    !`${msg[t.name as keyof Object]}`.includes("undefined")
                      ? `${msg[t.name as keyof Object]}`
                      : ""
                  }
                  key={ind}
                />
              ) : t.type === "days" ? (
                <MyMultiSelector
                  label={t.label}
                  value={details[t.name]}
                  onChangeValue={(u) => onChangeValue(u, t.name)}
                  options={toOptions(daysOfWeek)}
                  key={ind}
                  msg={
                    msg &&
                    !`${msg[t.name as keyof Object]}`.includes("undefined")
                      ? `${msg[t.name as keyof Object]}`
                      : ""
                  }
                  stringified
                />
              ) : t.type === "multi" ? (
                <MyMultiSelector
                  label={t.label}
                  value={details[t.name]}
                  onChangeValue={(u) => onChangeValue(u, t.name)}
                  options={t.options}
                  key={ind}
                  msg={
                    msg &&
                    !`${msg[t.name as keyof Object]}`.includes("undefined")
                      ? `${msg[t.name as keyof Object]}`
                      : ""
                  }
                />
              ) : t.type === "text" ? (
                <MyInput
                  label={t.label}
                  value={details[t.name]}
                  onChangeValue={(u) => onChangeValue(u, t.name)}
                  centered={t.centered}
                  key={ind}
                  msg={
                    msg &&
                    !`${msg[t.name as keyof Object]}`.includes("undefined")
                      ? `${msg[t.name as keyof Object]}`
                      : ""
                  }
                />
              ) : t.type === "textarea" ? (
                <MyTextArea
                  label={t.label}
                  value={details[t.name]}
                  onChangeValue={(u) => onChangeValue(u, t.name)}
                  centered={t.centered}
                  key={ind}
                  msg={
                    msg &&
                    !`${msg[t.name as keyof Object]}`.includes("undefined")
                      ? `${msg[t.name as keyof Object]}`
                      : ""
                  }
                />
              ) : t.type === "number" ? (
                <MyInput
                  label={t.label}
                  value={details[t.name]}
                  onChangeValue={(u) => onChangeValue(u, t.name)}
                  centered={t.centered}
                  key={ind}
                  msg={
                    msg &&
                    !`${msg[t.name as keyof Object]}`.includes("undefined")
                      ? `${msg[t.name as keyof Object]}`
                      : ""
                  }
                />
              ) : t.type === "image" ? (
                <MyImageUploader
                  value={details[t.name]}
                  onChangeValue={(u) => onChangeValue(u, t.name)}
                  key={ind}
                />
              ) : (
                <div
                  className="text-gray-300 items-center justify-center"
                  key={ind}
                >
                  {t.label}
                </div>
              )
            )}
          </div>
        ))}
        <label className="block text-sm font-medium dark:text-white text-red-600">
          <div>
            {msg &&
            !`${msg["nonFieldErrors" as keyof Object]}`.includes("undefined")
              ? `${msg["nonFieldErrors" as keyof Object]}`
              : ""}
          </div>
          <div>
            {msg && !`${msg["detail" as keyof Object]}`.includes("undefined")
              ? `${msg["detail" as keyof Object]}`
              : ""}
          </div>
        </label>
        <div className="flex flex-row-reverse justify-between items-center">
          <MyButton onClick={onClickSubmit} isLoading={isLoading} />
          {!hasDelete ? (
            <></>
          ) : (
            <DeleteIcon
              fontSize="large"
              className="text-gray-600 dark:text-gray-400"
              onClick={onClickDelete}
            />
          )}
        </div>
      </div>
    );
  }
);
