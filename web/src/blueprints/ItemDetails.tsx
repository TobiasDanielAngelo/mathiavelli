import { useState } from "react";
import { formatValue, toTitleCase } from "../constants/helpers";
import { observer } from "mobx-react-lite";

export interface KV<U extends Record<string, any>> {
  key: string;
  values: U[];
  label: keyof U;
}

interface ItemDetailsProps<T> {
  item: T;
  shownFields?: (keyof T)[];
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

export const ItemDetails = observer(
  <T extends Record<string, any>>({
    item,
    shownFields = [],
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
    const allItemKeys = Object.keys(item).filter(
      (s) => !s.includes("$")
    ) as (keyof T)[];
    const leftoverKeys = allItemKeys.filter(
      (key) => !allSectionKeys.includes(key)
    );
    const shownKeys = shownFields.filter((key) => allSectionKeys.includes(key));
    const hiddenKeys = allSectionKeys.filter((key) => !shownKeys.includes(key));

    const renderRow = (key: keyof T, title: string) => {
      const value = item[key];
      const keyTitle = key === "id" ? "ID" : toTitleCase(key as string);

      return (
        <div key={String(key)} className="flex gap-5">
          {title === "Body" && (
            <span className="w-[30%] text-right font-bold">{keyTitle}</span>
          )}
          <span className="w-[70%] whitespace-pre-wrap break-words">
            {formatValue(value, String(key), prices as string[])}
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
  }
);
