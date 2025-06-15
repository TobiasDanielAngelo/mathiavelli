import { observer } from "mobx-react-lite";
import { Dispatch, SetStateAction } from "react";
import { formatValue, toTitleCase } from "../constants/helpers";

export interface KV<U extends Record<string, any>> {
  key: string;
  values: U[];
  label: keyof U;
}

export interface ItemDetailsProps<T> {
  item: T;
  shownFields?: (keyof T)[];
  header?: (keyof T)[];
  important?: (keyof T)[];
  body?: (keyof T)[];
  prices?: (keyof T)[];
  showMore?: boolean;
  setShowMore?: Dispatch<SetStateAction<boolean>>;
}

const sectionStyles: Record<string, string> = {
  Header: "text-sm text-gray-400 flex flex-row",
  Important: "font-bold text-3xl text-white px-3 rounded",
  Body: "text-gray-400 text-lg px-7",
};

export const ItemDetails = observer(
  <T extends Record<string, any>>({
    item,
    shownFields = [],
    header = [],
    important = [],
    body = [],
    prices = [],
    showMore,
  }: ItemDetailsProps<T>) => {
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
    // const hiddenKeys = allSectionKeys.filter((key) => !shownKeys.includes(key));

    const renderRow = (key: keyof T, title: string) => {
      const value = item[key];
      const keyTitle = key === "id" ? "ID" : toTitleCase(key as string);
      const body = formatValue(value, String(key), prices as string[]);

      return body === "—" ? (
        <div key={String(key)}></div>
      ) : (
        <div key={String(key)} className="flex flex-col xs:flex-row">
          {title === "Body" && (
            <span className="pt-2 text-xs font-bold">{keyTitle}</span>
          )}
          <span className="pl-3 whitespace-pre-wrap break-words">{body}</span>
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
      </>
    );
  }
);
