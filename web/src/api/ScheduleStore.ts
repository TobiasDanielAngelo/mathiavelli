import { prop } from "mobx-keystone";
import {
  generateCollidingDates,
  generateScheduleDefinition,
} from "../constants/helpers";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { formatValue } from "../constants/JSXHelpers";
import { MyModel, MyStore } from "./GenericStore";

const slug = "productivity/schedules/";
const keyName = "Schedule";
const props = {
  id: prop<number | string>(-1),
  name: prop<string>(""),
  freq: prop<number>(0),
  interval: prop<number>(0),
  byWeekDay: prop<string[]>(() => []),
  byMonthDay: prop<number[]>(() => []),
  byMonth: prop<number[]>(() => []),
  byYearDay: prop<number[]>(() => []),
  byWeekNo: prop<number[]>(() => []),
  byHour: prop<number[]>(() => []),
  byMinute: prop<number[]>(() => []),
  bySecond: prop<number[]>(() => []),
  bySetPosition: prop<number[]>(() => []),
  count: prop<number | null>(null),
  startDate: prop<string>(""),
  endDate: prop<string>(""),
  weekStart: prop<number>(0),
  startTime: prop<string>(""),
  endTime: prop<string>(""),

  associatedTask: prop<number | string | null>(null),
  associatedHabit: prop<number | string | null>(null),
};

const derivedProps = (item: ScheduleInterface) => ({
  freqName: FREQ_CHOICES.find((_, ind) => ind === item.freq) ?? "—",
  weekStartName:
    WEEKDAY_CHOICES.find((_, ind) => ind === item.weekStart) ?? "—",
  collidingDates: formatValue(
    generateCollidingDates(item),
    "",
    [],
    undefined,
    item.count === 0 || item.count === null ? true : false
  ),
  definition: generateScheduleDefinition(item) ?? "",
});

export const FREQ_CHOICES = [
  "Yearly",
  "Monthly",
  "Weekly",
  "Daily",
  "Hourly",
  "Minutely",
  "Secondly",
];
export const WEEKDAY_CHOICES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export type ScheduleInterface = PropsToInterface<typeof props>;

export const ScheduleFields: ViewFields<ScheduleInterface> = {
  datetimeFields: [] as const,
  dateFields: ["startDate", "endDate"] as const,
  timeFields: ["startTime", "endTime"] as const,
  pricesFields: [] as const,
};

export class Schedule extends MyModel(keyName, props, derivedProps) {}
export class ScheduleStore extends MyStore(keyName, Schedule, slug) {}
