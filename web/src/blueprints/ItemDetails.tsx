import moment from "moment";
import { isDateValue, toMoney } from "../constants/helpers";
import { useState } from "react";

interface KV<U extends Record<string, any>> {
  key: string;
  values: U[];
  label: keyof U;
}

interface ItemDetailsProps<T> {
  item: T;
  shownFields?: (keyof T)[];
  itemMap?: KV<any>[];
  header?: (keyof T)[];
  important?: (keyof T)[];
  body?: (keyof T)[];
  prices?: (keyof T)[];
}

const sectionStyles: Record<string, string> = {
  Header: "text-sm text-gray-400",
  Important: "font-bold text-xl text-white px-3 rounded",
  Body: "text-gray-400 text-sm px-2",
};

const formatValue = (
  value: any,
  key: string,
  kv: KV<any> | undefined,
  prices: string[]
) => {
  if (prices.includes(key)) return toMoney(value);
  if (kv) {
    const lookup = (val: any) =>
      kv.label === ""
        ? kv.values.find((_, i) => i + 1 === Number(val))
        : kv.values.find((v) => v.id === val)?.[kv.label] ?? "—";

    return Array.isArray(value) ? value.map(lookup).join(", ") : lookup(value);
  }
  if (typeof value === "boolean") {
    return (
      <label className="flex items-center gap-1">
        <input
          type="checkbox"
          checked={value}
          readOnly
          className="form-checkbox text-green-500"
        />
        <span>{value ? "Yes" : "No"}</span>
      </label>
    );
  }
  if (
    (String(key).toLowerCase().includes("date") && value) ||
    isDateValue(value)
  ) {
    return moment(value).format("MMM D, YYYY h:mm A");
  }
  return value?.toString() || "—";
};

export const ItemDetails = <T extends Record<string, any>>({
  item,
  shownFields = [],
  itemMap = [],
  header = [],
  important = [],
  body = [],
  prices = [],
}: ItemDetailsProps<T>) => {
  const [showMore, setShowMore] = useState(false);

  const sections = [
    { title: "Header", keys: header },
    { title: "Important", keys: important },
    {
      title: "Body",
      keys: body,
      // Array.from(new Set([...(body || []), ...(shownFields || [])])).filter((s) => !header.includes(s) && !important.includes(s)),
    },
  ];

  const allSectionKeys = sections.flatMap((s) => s.keys);
  const allItemKeys = Object.keys(item) as (keyof T)[];
  const leftoverKeys = allItemKeys.filter(
    (key) => !allSectionKeys.includes(key)
  );
  const shownKeys = shownFields.filter((key) => allSectionKeys.includes(key));
  const hiddenKeys = allSectionKeys.filter((key) => !shownKeys.includes(key));

  const renderRow = (key: keyof T, title: string) => {
    const value = item[key];
    const kv = itemMap.find((s) => s.key === key);
    const keyTitle =
      key === "id"
        ? "ID"
        : String(key)
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase());

    return (
      <div key={String(key)} className="flex gap-5">
        {title === "Body" && (
          <span className="w-[25%] text-right font-bold">{keyTitle}</span>
        )}
        <span className="w-[75%] whitespace-pre-wrap break-words">
          {formatValue(value, String(key), kv, prices as string[])}
        </span>
      </div>
    );
  };

  return (
    <>
      {sections.map(({ title, keys }) => (
        <div key={title} className={sectionStyles[title] || ""}>
          {keys
            .filter((key) => shownKeys.includes(key) || showMore)
            .map((key) => renderRow(key, title))}
          {title === "Body" &&
            showMore &&
            leftoverKeys.map((key) => renderRow(key, title))}
        </div>
      ))}

      {hiddenKeys.length + leftoverKeys.length > 0 && (
        <div
          className="text-blue-500 font-bold text-sm cursor-pointer m-2"
          onClick={() => setShowMore(!showMore)}
        >
          {showMore ? "Show Less" : ". . . Show More"}
        </div>
      )}
    </>
  );
};
