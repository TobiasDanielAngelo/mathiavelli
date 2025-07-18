import { observer } from "mobx-react-lite";
import { winWidth } from "../constants/constants";
import { useVisible } from "../constants/hooks";
import { Field } from "../constants/interfaces";
import {
  MyButton,
  MyCheckBox,
  MyConfirmModal,
  MyDateTimePicker,
  MyDropdownSelector,
  MyFileUploader,
  MyImageUploader,
  MyInput,
  MyMultiDropdownSelector,
  MyTextArea,
} from "./";
import { MyIcon } from "./MyIcon";
import { Text, View } from "react-native";

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
    case "function":
      return (
        <View key={key}>
          <Text>{t.label}</Text>
          {t.function?.(details)}
        </View>
      );
    case "password":
      return <MyInput key={key} {...commonProps} isPassword />;
    case "select":
      return (
        <MyDropdownSelector key={key} {...commonProps} options={t.options} />
      );
    case "date":
    case "time":
    case "datetime":
      return (
        <MyDateTimePicker
          {...commonProps}
          key={key}
          isDateOnly={t.type === "date"}
          isTimeOnly={t.type === "time"}
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
      return <MyInput key={key} {...commonProps} />;
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
    case "file":
      return (
        <MyFileUploader
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
      return <View key={key}>{t.label}</View>;
  }
};

type FormProps = {
  fields: (Field | undefined)[][];
  title: string;
  objectName?: string;
  details: any;
  setDetails: (t: any) => void;
  onClickSubmit: () => void;
  onClickSubmitAdd: () => void;
  hasDelete?: boolean;
  onDelete?: () => Promise<void>;
  msg?: Object;
  isLoading?: boolean;
};

export type MyFormProps<T extends Object & { id: number | null }> = {
  item?: T;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
};

export const MyForm = observer(
  ({
    fields,
    title,
    objectName,
    details,
    setDetails,
    onClickSubmit,
    onClickSubmitAdd,
    hasDelete,
    onDelete,
    msg,
    isLoading,
  }: FormProps) => {
    const { isVisible1, setVisible1 } = useVisible();

    const onChangeValue = (val: any, name: string) =>
      setDetails({ ...details, [name]: val });

    const onClickDelete = () => {
      setVisible1?.(true);
    };
    const onClickConfirm = async () => {
      await onDelete?.();
    };

    return (
      <View>
        <MyConfirmModal
          isVisible={isVisible1}
          setVisible={setVisible1}
          onClickCheck={onClickConfirm}
          objectName={objectName}
          actionName="Delete"
        />
        <Text>{title}</Text>
        {fields.map((row, rowIdx) => (
          <View key={rowIdx}>
            {row.map((t, colIdx) =>
              t ? (
                renderField(t, details, onChangeValue, msg, colIdx)
              ) : (
                <View key={colIdx}></View>
              )
            )}
          </View>
        ))}
        <Text>{getMsg(msg, "nonFieldErrors")}</Text>
        <Text>{getMsg(msg, "detail")}</Text>
        <View>
          <MyButton
            onPress={onClickSubmit}
            isLoading={isLoading}
            label="Save"
          />
          {!hasDelete ? (
            <MyButton
              onPress={onClickSubmitAdd}
              isLoading={isLoading}
              label="Save and Add"
            />
          ) : (
            <MyIcon icon="trash" onPress={onClickDelete} />
          )}
        </View>
      </View>
    );
  }
);
