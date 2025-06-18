import LZString from "lz-string";
import moment from "moment";
import { Options, RRule, rrulestr, Weekday } from "rrule";
import { GoalInterface } from "../api/GoalStore";
import { Schedule, ScheduleInterface } from "../api/ScheduleStore";
import { KV } from "../blueprints/ItemDetails";
import { Option } from "./interfaces";
import { parse, format, isValid } from "date-fns";

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

/**
 * Replaces multiple substrings in a string with a given replacement.
 * Returns '-' if the final string is empty or only whitespace.
 *
 * @param {string} str - The input string.
 * @param {string[]} find - Array of substrings to replace.
 * @param {string} replace - Replacement string.
 * @returns {string} - Modified string or '-' if empty.
 *
 * @example
 * replaceCumulative("Hello, World!", [",", "!"], ""); // "Hello World"
 * replaceCumulative("   ", [" "], "");                // "-"
 */
export const replaceCumulative = (
  str: string,
  find: string[],
  replace: string
): string => {
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

/**
 * Sorts an array of objects by a specified key (assumed to be a date or date-like string).
 *
 * @template T - The type of objects in the array.
 * @param {T[]} arr - The array to sort.
 * @param {keyof T} keyName - The key to sort by.
 * @param {boolean} [decreasing=false] - Whether to sort in descending order.
 * @returns {T[]} - A new sorted array.
 *
 * @example
 * sortByKey(users, "createdAt", true); // Sorts users by createdAt descending
 */
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

/**
 * Converts an array of strings or objects into a standardized `Option[]` format.
 *
 * @template T - The item type (string or object).
 * @param {T[]} items - The input array.
 * @param {keyof T} [keyName] - The key to use as display name (only for object items).
 * @returns {Option[]} - Array of options with `id` and `name`.
 *
 * @example
 * toOptions(["Red", "Green"]);
 * // [{ id: 0, name: "Red" }, { id: 1, name: "Green" }]
 *
 * toOptions(users, "username");
 * // [{ id: 1, name: "johndoe" }, ...]
 */
export const toOptions = <T>(items: T[], keyName?: keyof T): Option[] => {
  return items.map((item, index) => {
    if (typeof item === "string") {
      return { id: index, name: item };
    } else {
      const obj = item as Record<string, any>;
      return {
        id: obj.id ?? index,
        name: obj[keyName as string] ?? "",
      };
    }
  });
};

export const timeDifference = (start: Date | string, end?: Date | string) => {
  let td = new Date(end ?? "").getTime() - new Date(start).getTime();
  return moment(new Date(td)).utc(false).format("H[h] mm[m]");
};

/**
 * Converts a string to Title Case, preserving acronyms and numbers.
 *
 * @param {string} [str] - The input string.
 * @returns {string} - The title-cased string.
 *
 * @example
 * toTitleCase("helloWorld")        // "Hello World"
 * toTitleCase("myURL123value")     // "My URL 123 Value"
 * toTitleCase("user_id")           // "User Id"
 * toTitleCase("")                  // ""
 */
export const toTitleCase = (str?: string): string => {
  return str
    ? str
        .match(/[A-Z]{2,}(?=[A-Z][a-z]+|\b)|[A-Z]?[a-z]+|[0-9]+|[A-Z]/g)
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
      ? ` —`
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
  if (keys.includes(e.key)) callback?.();
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

export const camelToSnakeCase = (str: string, dunder?: boolean) => {
  const matches = [...str.matchAll(/[A-Z]/g)];
  if (!matches.length) return str;

  return str.replace(/[A-Z]/g, (letter, index) => {
    const isLast = matches[matches.length - 1].index === index;
    return `${dunder && isLast ? "__" : "_"}${letter.toLowerCase()}`;
  });
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

/**
 * Returns the intersection of two string arrays.
 *
 * @param {string[]} arr1 - First array of strings.
 * @param {string[]} arr2 - Second array of strings.
 * @returns {string[]} - Array of common strings found in both arrays.
 */
export const intersectionArrStrs = (
  arr1: string[],
  arr2: string[]
): string[] => {
  const setA = new Set(arr1);
  return arr2.filter((value) => setA.has(value));
};

/**
 * Checks if all parts of the query exist in the target string (case-insensitive).
 *
 * @param {string} str - The target string to search in.
 * @param {string} query - The search query, split by spaces or commas.
 * @returns {boolean} - True if all query parts are found in the string.
 */

export const isQueryMatch = (str: string, query: string): boolean => {
  return query
    .split(/[ ,]+/)
    .every((v) => str.toLowerCase().includes(v.toLowerCase()));
};

export const setBlankIfNeg1 = (str: string, val: number) => {
  return val === -1 ? str : "";
};

export const cmToPx = (cm: number) => cm / 0.026458;

export const getFirstWords = (str: string, len = 1) => {
  const words = str.trim().split(/[\s,–—-]+/);
  return words.length > len ? words.slice(0, len).join(" ") + "..." : str;
};

export const isDatetimeValue = (val: any) => {
  if (typeof val !== "string") return false;
  const parsed = Date.parse(val);
  // Ensure it's a valid date and includes time components
  return (
    !isNaN(parsed) && /\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(val) // date + time format
  );
};

export const isDateValue = (val: any) => {
  if (typeof val !== "string") return false;
  const parsed = Date.parse(val);
  return (
    !isNaN(parsed) && /^\d{4}-\d{2}-\d{2}$/.test(val) // exact date format: YYYY-MM-DD
  );
};

export const formatValue = (
  value: any,
  key: string,
  prices?: string[],
  kv?: KV<any>
) => {
  if (kv) {
    const lookup = (val: any) =>
      kv.label === ""
        ? kv.values.find((_, i) => i === val)
        : kv.values.find((v) => v.id === val)?.[kv.label] ?? "—";

    return Array.isArray(value) ? value.map(lookup).join(",") : lookup(value);
  }
  if (prices?.includes(key)) return toMoney(value);
  if (typeof value === "boolean") {
    return value ? "✅ Yes" : "❌ No";
  }
  if (isDatetimeValue(value)) {
    return moment(value).format("MMM D, YYYY h:mm A");
  }
  if (isDateValue(value)) {
    return moment(value).format("MMM D, YYYY");
  }

  return value?.toString() || "—";
};

/**
 * Creates a string signature from selected keys of an object.
 *
 * @template T - The object type.
 * @param {T} model - The object to extract values from.
 * @param {(keyof T)[]} keys - Keys whose values will form the signature.
 * @returns {string} - A pipe-separated string of the selected values.
 */
export function getModelSignature<T extends { [key: string]: any }>(
  model: T,
  keys: (keyof T)[]
): string {
  return keys.map((key) => String(model[key])).join("|");
}

export function getStoreSignature<T extends Record<string, any>>(
  items: T[]
): string {
  return items
    .map((item) =>
      Object.keys(item)
        .map((key) => String(item[key as keyof T]))
        .join("|")
    )
    .join("::");
}

/**
 * Cleans a string by replacing all non-alphanumeric characters with spaces.
 *
 * @param {string} input - The string to clean.
 * @returns {string} - The cleaned string with only letters, numbers, and spaces.
 */
export const cleanText = (input: string) => {
  return input.replace(/[^a-zA-Z0-9]+/g, " ");
};

/**
 * Compresses an object into a URI-safe, short string using LZString.
 *
 * @param {object} data - The data object to compress.
 * @returns {string} - A URI-safe compressed string.
 */
export const generateShortParam = (data: object) => {
  return LZString.compressToEncodedURIComponent(JSON.stringify(data));
};

/**
 * Decompresses and parses a URI-safe compressed string into an object.
 *
 * @param {string | null} param - The compressed string.
 * @returns {Record<string, any>} - The decompressed object, or empty object on error.
 */
export const decodeShortParam = (param: string | null): Record<string, any> => {
  try {
    if (!param || typeof param !== "string") throw new Error("Invalid param");

    const json = LZString.decompressFromEncodedURIComponent(param);
    return json ? JSON.parse(json) : {};
  } catch (e) {
    console.error("Decoding failed:", e);
    return {};
  }
};

export const months = [
  { short: "Jan", long: "January" },
  { short: "Feb", long: "February" },
  { short: "Mar", long: "March" },
  { short: "Apr", long: "April" },
  { short: "May", long: "May" },
  { short: "Jun", long: "June" },
  { short: "Jul", long: "July" },
  { short: "Aug", long: "August" },
  { short: "Sep", long: "September" },
  { short: "Oct", long: "October" },
  { short: "Nov", long: "November" },
  { short: "Dec", long: "December" },
];

/**
 * Returns the month name based on a month index (0–11).
 *
 * @param {number} monthNum - The month index (0 = January, 11 = December).
 * @param {"short" | "long"} [type="short"] - Format of the month name.
 * @returns {string} - The corresponding month name or "Invalid" if out of range.
 */
export function getMonthName(
  monthNum: number,
  type: "short" | "long" = "short"
): string {
  const index = monthNum;
  if (index < 0 || index > 11) return "Invalid";
  return months[index][type];
}

/**
 * Extracts unique, non-null numeric values from a specified key in an array of objects.
 *
 * @template T - The object type in the array.
 * @template K - The key of T to extract values from.
 * @param {T[]} data - Array of objects to extract from.
 * @param {K} key - The key whose values will be collected.
 * @returns {number[]} - An array of unique numeric values (excluding undefined/null).
 */
export const getUniqueIdsFromFK = <T, K extends keyof T>(
  data: T[],
  key: K
): number[] => {
  return Array.from(new Set(data.map((item) => item[key] ?? -1))).filter(
    (id) => id !== -1
  ) as (T[K] extends number ? number : never)[];
};

/**
 * Generates a 10-character alphanumeric ID based on the current timestamp and random data.
 * - Uses base36 to keep it compact.
 * - Ensures uniqueness across time and multiple calls.
 */
export function generateShortId(): string {
  const timePart = Date.now().toString(36); // base36 = time-encoded
  const randomPart = Math.random().toString(36).substring(2, 10); // remove "0."
  return (timePart + randomPart).substring(0, 10); // combine & trim to 10 chars
}

export function sortAndFilterByIds<T>(
  items: T[],
  ids: (number | string)[],
  getId: (item: T) => number | string
): T[] {
  return items
    .filter((item) => ids.includes(getId(item)))
    .sort((a, b) => ids.indexOf(getId(a)) - ids.indexOf(getId(b)));
}

export const getDescendantIds = (
  allGoals: GoalInterface[],
  goalId?: number
): number[] => {
  const directChildren = allGoals
    .filter((g) => g.parentGoal === goalId)
    .map((s) => s.id) as number[];
  const allDescendants = directChildren.flatMap((c) =>
    getDescendantIds(allGoals, c)
  );
  return [...directChildren, ...allDescendants];
};

const WEEKDAY_MAP: Record<string, Weekday> = {
  MO: RRule.MO,
  TU: RRule.TU,
  WE: RRule.WE,
  TH: RRule.TH,
  FR: RRule.FR,
  SA: RRule.SA,
  SU: RRule.SU,
};

export function cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, v]) =>
        v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0)
    )
  ) as Partial<T>;
}

/**
 * Converts a local date to a UTC-equivalent Date for RRULE processing.
 * Adjusts by the local timezone offset.
 */
export const toUTCForRRule = (date: Date | string | null): Date | null =>
  !date
    ? null
    : moment(new Date(date))
        .add(-new Date().getTimezoneOffset(), "minutes")
        .toDate();

function normalizeDate(dateStr: string | null | Date | undefined): string {
  if (typeof dateStr !== "string") {
    return format(dateStr as Date, "yyyy-MM-dd");
  }
  const formats = ["MMM d, yyyy", "yyyy-MM-dd"];
  for (const fmt of formats) {
    const parsed = parse(dateStr, fmt, new Date());
    if (isValid(parsed)) return format(parsed, "yyyy-MM-dd");
  }
  return dateStr;
}

function normalizeTime(timeStr: string | null | Date | undefined): string {
  if (typeof timeStr !== "string") {
    return format(timeStr as Date, "HH:mm:ss");
  }
  const formats = ["h:mm a", "HH:mm:ss"];
  for (const fmt of formats) {
    const parsed = parse(timeStr, fmt, new Date());
    if (isValid(parsed)) return format(parsed, "HH:mm:ss");
  }
  return format(timeStr, "HH:mm:ss");
}

export function isValidRRuleOptions(options: Partial<Options>): boolean {
  const allowedFreq = [0, 1, 2, 3, 4, 5, 6]; // YEARLY to SECONDLY

  if (!options) return false;

  // FREQ is required
  if (typeof options.freq !== "number" || !allowedFreq.includes(options.freq)) {
    return false;
  }

  // DTSTART must be a valid Date
  if (!(options.dtstart instanceof Date) || isNaN(options.dtstart.getTime())) {
    return false;
  }

  // INTERVAL must be a positive number (optional)
  if (
    options.interval &&
    (!Number.isInteger(options.interval) || options.interval <= 0)
  ) {
    return false;
  }

  // COUNT must be a positive integer (optional)
  if (
    options.count &&
    (!Number.isInteger(options.count) || options.count <= 0)
  ) {
    return false;
  }

  // UNTIL must be a valid Date (optional)
  if (
    options.until &&
    (!(options.until instanceof Date) || isNaN(options.until.getTime()))
  ) {
    return false;
  }

  return true;
}

/**
 * Converts a UTC date from RRULE back to local time.
 * Adjusts by adding the local timezone offset.
 */
export const fromUTCForRRule = (date: Date | string): Date | null =>
  !date
    ? null
    : moment(new Date(date))
        .add(new Date().getTimezoneOffset(), "minutes")
        .toDate();

export function buildRRule(schedule: ScheduleInterface): RRule | null {
  const start = !schedule.startDate
    ? null
    : !schedule.startTime
    ? `${normalizeDate(schedule.startDate)}`
    : `${normalizeDate(schedule.startDate)}T${normalizeTime(
        schedule.startTime || "00:00"
      )}`;

  const end = !schedule.endDate
    ? null
    : !schedule.endTime
    ? `${normalizeDate(schedule.endDate)}`
    : `${normalizeDate(schedule.endDate)}T${normalizeTime(
        schedule.endTime || "00:00"
      )}`;

  const ruleOptions = {
    freq: Number(schedule.freq) ?? RRule.DAILY,
    interval: Number(schedule.interval) || 1,
    byweekday: schedule.byWeekDay
      ?.map(Number)
      ?.map((d) => WEEKDAY_MAP[d])
      .filter(Boolean) as Weekday[],
    bymonth: schedule.byMonth?.map(Number) ?? undefined,
    bymonthday: schedule.byMonthDay?.map(Number) ?? undefined,
    byyearday: schedule.byYearDay?.map(Number) ?? undefined,
    byweekno: schedule.byWeekNo?.map(Number) ?? undefined,
    byhour: schedule.byHour?.map(Number) ?? undefined,
    byminute: schedule.byMinute?.map(Number) ?? undefined,
    bysecond: schedule.bySecond?.map(Number) ?? undefined,
    bySetPosition: schedule.bySetPosition?.map(Number) ?? undefined,
    count: Number(schedule.count) ?? 10,
    dtstart: toUTCForRRule(start),
    until: toUTCForRRule(end),
  };

  if (!isValidRRuleOptions(ruleOptions)) return null;

  try {
    const rule = new RRule(cleanObject(ruleOptions) as Options);
    return rule;
  } catch (e) {
    console.error("Failed to build RRule:", e, ruleOptions);
    return null;
  }
}

export function generateCollidingDates(sched: Schedule): (string | Date)[] {
  const schedule = sched.$ ?? sched;
  const rule = buildRRule(schedule);
  if (!rule) return [];

  const ruleStr = rule.toString();
  console.log(rule.toString());
  console.log(rrulestr(ruleStr).all());

  return rule
    .all()
    .map(fromUTCForRRule)
    .map((dt) => moment(dt).format("lll"));
}

export function range(a: number, b: number): number[] {
  return Array.from({ length: b - a }, (_, i) => i + a);
}
