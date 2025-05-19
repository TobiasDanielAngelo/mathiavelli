import moment from "moment";
import { Option } from "./interfaces";

export const posRamp = (x: number) => (x > 0 ? x : 0);

export const getOrdinal = (n: number) => {
  let ord = "th";

  if (n % 10 == 1 && n % 100 != 11) {
    ord = "st";
  } else if (n % 10 == 2 && n % 100 != 12) {
    ord = "nd";
  } else if (n % 10 == 3 && n % 100 != 13) {
    ord = "rd";
  }
  return ord;
};

export const replaceCumulative = (
  str: string,
  find: string[],
  replace: string
) => {
  for (var i = 0; i < find.length; i++)
    str = str.replace(new RegExp(find[i], "g"), replace);
  return str.replace(/\s/g, "") !== "" ? str : "-";
};

export const getDateFromSched = (date: Date, sched: number) => {
  const lastDayOfMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate();

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    Math.min(sched, lastDayOfMonth)
  );
};

export const isSchedIncluded = (dates: Date[], sched: number) => {
  const lastDayOfMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();

  const day28 = dates.find((s) => s.getDate() === 28);
  return sched <= 28
    ? dates.map((s) => s.getDate()).includes(sched)
    : sched <= 31
    ? !!day28 && lastDayOfMonth(day28.getFullYear(), day28.getMonth()) <= sched
    : sched === 32
    ? !!day28 &&
      dates
        .map((s) => s.getDate())
        .includes(lastDayOfMonth(day28.getFullYear(), day28.getMonth()))
    : true;
};

export const scheduledAmount = (
  amount: number,
  dates: Date[],
  schedule: number
) => {
  return isSchedIncluded(dates, schedule) ? amount : 0;
};

export const areArraysIdentical = (arr1: string[], arr2: string[]) =>
  arr2.every((v) => arr1.includes(v)) && arr1.every((v) => arr2.includes(v));

export const isSubset = (smallArr: string[], largeArr: string[]) => {
  return smallArr.every((t) => largeArr.includes(t));
};

export const addDays = (date: Date, days: number) => {
  let result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const timeDifferenceTime = (startTime: string, endTime: string) => {
  let start = new Date(moment(startTime, "hh:mm A").toISOString());
  let end = new Date(moment(endTime, "hh:mm A").toISOString());

  return end.getTime() > start.getTime()
    ? (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    : 0;
};

export const sortByKey = <T>(
  arr: T[],
  keyName: keyof T,
  decreasing: boolean = false
): T[] => {
  return arr.slice().sort((a, b) => {
    const aVal = a[keyName];
    const bVal = b[keyName];

    const dateA = new Date(aVal as any);
    const dateB = new Date(bVal as any);

    return decreasing
      ? dateB.getTime() - dateA.getTime()
      : dateA.getTime() - dateB.getTime();
  });
};

export const toOptions = (items: any[], keyName?: string): Option[] => {
  return items.map((s, ind) => ({
    id: typeof s === "string" ? ind + 1 : s.id,
    name: typeof s === "string" ? s : (s as any)[keyName ?? ""],
  }));
};

export const timeDifference = (start: Date | string, end?: Date | string) => {
  let td = new Date(end ?? "").getTime() - new Date(start).getTime();
  return moment(new Date(td)).utc(false).format("H[h] mm[m]");
};

export const toTitleCase = (str?: string) => {
  return str
    ? str
        .match(
          /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
        )
        ?.map((x) => x.charAt(0).toUpperCase() + x.slice(1))
        .join(" ") ?? ""
    : "";
};

export const toMoney = (n?: any) => {
  if (isNaN(n)) return "";
  if (!isFinite(n)) return "\u221e";
  return (
    `\u20b1` +
    (!n
      ? ` \u2013`
      : n > 0
      ? n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      : "(" +
        Math.abs(n)
          .toFixed(2)
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
        ")")
  );
};

export const toHours = (n?: any) => {
  if (isNaN(n)) return ` \u2013`;
  if (!isFinite(n)) return "\u221e";
  return !n
    ? ` \u2013`
    : `${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}h`;
};

export const hoursToWorkDays = (n: number, hoursPerDay?: number) => {
  if (isNaN(n)) return ` \u2013`;
  if (!isFinite(n)) return "\u221e";
  return !n
    ? ` \u2013`
    : `${(n / (hoursPerDay ?? 24))
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} work days`;
};

export const handleKeyDown = (
  e: KeyboardEvent,
  keys: string[],
  callback?: () => void
) => {
  if (keys.includes(e.key)) callback && callback();
};

export const rounded = (t: number, numDigits?: number) =>
  Math.round(t * 10 ** (numDigits ?? 2)) / 10 ** (numDigits ?? 2);

export const mySum = (numArr?: number[]) => {
  return numArr?.reduce((a, b) => a + b, 0) ?? 0;
};

export const myProduct = (t: number[]) => rounded(t.reduce((a, b) => a * b, 1));

export const camelCaseToWords = (s: string) => {
  const result = s.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};

export const createArrayFromN = (n: number) => {
  return Array.from(Array(n).keys());
};

export const getDatesFromSched = (
  dateStart: Date,
  sched: number,
  count: number,
  frequency: number
) => {
  return createArrayFromN(count).map((s) => {
    let date = new Date(dateStart);
    date.setMonth(date.getMonth() + s * frequency);
    date.setDate(
      Math.min(
        sched,
        new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
      )
    );
    return date;
  });
};

export const intersectionArrStrs = (arr1: string[], arr2: string[]) => {
  const setA = new Set(arr1);
  return arr2.filter((value) => setA.has(value));
};

export const isQueryMatch = (str: string, query: string) => {
  // let regex = /[^A-Za-z0-9]/
  return query
    .split(/[ ,]+/)
    .every((v) => str.toLowerCase().includes(v.toLowerCase()));
};

export const setBlankIfNeg1 = (str: string, val: number) => {
  return val === -1 ? str : "";
};

export const cmToPx = (cm: number) => cm / 0.026458;

export const getFirstTwoWords = (str: string) => {
  const words = str.trim().split(/[\s,–—-]+/); // split by space, comma, dash variants
  return words.length > 2 ? `${words[0]} ${words[1]}...` : str;
};
