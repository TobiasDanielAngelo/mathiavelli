import DeleteIcon from "@mui/icons-material/Delete";
import { observer } from "mobx-react-lite";
import { daysOfWeek } from "../constants/constants";
import { toOptions } from "../constants/helpers";
import { useKeyPress, useVisible } from "../constants/hooks";
import { Field } from "../constants/interfaces";
import {
  MyButton,
  MyCheckBox,
  MyColorPicker,
  MyConfirmModal,
  MyDateTimePicker,
  MyDropdownSelector,
  MyImageUploader,
  MyInput,
  MyMultiDropdownSelector,
  MyMultiSelector,
  MyTextArea,
} from "./";

const getMsg = (msg: any, name: string) =>
  msg && !`${msg[name as keyof Object]}`.includes("undefined")
    ? `${msg[name as keyof Object]}`.includes("Invalid pk")
      ? "Select one that applies"
      : `${msg[name as keyof Object]}`
    : "";

const renderField = (
  t: Field,
  details: any,
  onChangeValue: any,
  msg: any,
  key: number
) => {
  const commonProps = {
    label: t.label,
    value: details[t.name],
    onChangeValue: (u: any) => onChangeValue(u, t.name),
    msg: getMsg(msg, t.name),
  };

  switch (t.type) {
    case "password":
      return <MyInput key={key} {...commonProps} isPassword />;
    case "select":
      return (
        <MyDropdownSelector key={key} {...commonProps} options={t.options} />
      );
    case "date":
    case "time":
    case "datetime":
    case "month":
      return (
        <MyDateTimePicker
          {...commonProps}
          key={key}
          isDateOnly={t.type === "date" || t.type === "month"}
          dateFormat={t.type === "month" ? "MMM YYYY" : undefined}
          isTimeOnly={t.type === "time"}
        />
      );
    case "days":
      return (
        <MyMultiSelector
          key={key}
          {...commonProps}
          options={toOptions(daysOfWeek)}
        />
      );
    case "multi":
      return (
        <MyMultiDropdownSelector
          key={key}
          {...commonProps}
          options={t.options}
        />
      );
    case "textarea":
      return (
        <MyTextArea
          key={key}
          {...commonProps}
          value={details[t.name] ?? ""}
          centered={t.centered}
        />
      );
    case "color":
      return <MyColorPicker key={key} {...commonProps} />;
    case "check":
      return <MyCheckBox key={key} {...commonProps} />;
    case "image":
      return (
        <MyImageUploader
          value={details[t.name]}
          onChangeValue={(u: any) => onChangeValue(u, t.name)}
          key={key}
        />
      );
    case "number":
    case "text":
      return (
        <MyInput
          key={key}
          {...commonProps}
          value={details[t.name] ?? ""}
          centered={t.centered}
        />
      );
    default:
      return (
        <div className="text-gray-300 items-center justify-center" key={key}>
          {t.label}
        </div>
      );
  }
};

export const MyForm = observer(
  ({
    fields,
    title,
    objectName,
    details,
    setDetails,
    onClickSubmit,
    hasDelete,
    onDelete,
    msg,
    isLoading,
  }: {
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
    useKeyPress(["Enter"], onClickSubmit);
    const { isVisible1, setVisible1 } = useVisible();

    const onChangeValue = (val: any, name: string) =>
      setDetails({ ...details, [name]: val });

    const onClickDelete = () => {
      setVisible1 && setVisible1(true);
    };
    const onClickConfirm = async () => {
      onDelete && (await onDelete());
    };

    return (
      <div className="max-w-md mx-auto p-10">
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
        {fields.map((row, rowIdx) => (
          <div
            className="grid md:gap-6"
            key={rowIdx}
            style={{
              gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`,
            }}
          >
            {row.map((t, colIdx) =>
              t ? (
                renderField(t, details, onChangeValue, msg, colIdx)
              ) : (
                <div key={colIdx}></div>
              )
            )}
          </div>
        ))}
        <label className="block text-sm font-medium dark:text-white text-red-600">
          <div>{getMsg(msg, "nonFieldErrors")}</div>
          <div>{getMsg(msg, "detail")}</div>
        </label>
        <div className="flex flex-row-reverse justify-between items-center">
          <MyButton onClick={onClickSubmit} isLoading={isLoading} />
          {hasDelete && (
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
