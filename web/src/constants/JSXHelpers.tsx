import moment from "moment";
import { isDatetimeValue, isDateValue, toMoney } from "./helpers";
import { KV } from "../blueprints/ItemDetails";

export const formatValue = (
  value: any,
  key: string,
  prices?: string[],
  kv?: KV<any>,
  arrayIsInfinite?: boolean
) => {
  const formatList = (
    value: Date[],
    formatStr: string,
    suffixLabel: string
  ): string => {
    const list = value
      .slice(0, 3)
      .map((s) => moment(s).format(formatStr))
      .join("\n");

    const remaining = value.length - 4;
    const suffix = arrayIsInfinite
      ? `${suffixLabel}ad infinitum...`
      : value.length >= 4
      ? `${suffixLabel}and ${remaining} more...`
      : "";

    const finalDate = !arrayIsInfinite
      ? `\nup to ${moment(value[value.length - 1]).format(formatStr)}`
      : "";

    return list + suffix + finalDate;
  };

  const fileExtensionRegex = /\.(jpg|jpeg|png|gif|pdf|docx?|xlsx?|txt)$/i;

  if (kv) {
    const lookup = (val: any) =>
      kv.label === ""
        ? kv.values.find((_, i) => i === val)
        : kv.values.find((v) => v.id === val)?.[kv.label] ?? "—";

    return Array.isArray(value) ? value.map(lookup).join(",") : lookup(value);
  }
  if (prices?.includes(key)) return toMoney(value);

  if (value instanceof File) {
    const url = URL.createObjectURL(value);
    return (
      <a href={url} download={value.name}>
        ⬇️ Download {value.name}
      </a>
    );
  } else if (value instanceof Blob) {
    const url = URL.createObjectURL(value);
    return (
      <a href={url} download="file">
        ⬇️ Download file
      </a>
    );
  } else if (typeof value === "string" && value.match(fileExtensionRegex)) {
    return (
      <a href={value} target="_blank" rel="noopener noreferrer">
        🔗 Link
      </a>
    );
  }

  if (typeof value === "boolean") {
    return value ? "✅ Yes" : "❌ No";
  }
  if (Array.isArray(value) && value.length > 0) {
    if (isDatetimeValue(value[0])) {
      return formatList(value, "MMM D, YYYY h:mm A, Z", "\n");
    }
    if (isDateValue(value[0])) {
      return formatList(value, "MMM D, YYYY", "and ");
    } else {
      return value.join(", ");
    }
  } else {
    if (isDatetimeValue(value)) {
      return moment(value).format("MMM D, YYYY h:mm A, Z");
    }
    if (isDateValue(value)) {
      return moment(value).format("MMM D, YYYY");
    }
  }

  return value?.toString() || "—";
};
