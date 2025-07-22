import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { getStoreItem, MyModel, MyStore } from "./GenericStore";

const slug = "productivity/habits/";
const keyName = "Habit";
const props = {
  id: prop<number | string>(-1),
  title: prop<string>(""),
  description: prop<string>(""),
  goal: prop<number | null>(null),
  schedule: prop<number | string | null>(null),
  thresholdPercent: prop<number>(0),
  dateStart: prop<string>(""),
  dateEnd: prop<string>(""),
  dateCompleted: prop<string>(""),
  isArchived: prop<boolean>(false),
  dateCreated: prop<string>(""),
  points: prop<number>(0),
};

const derivedProps = (item: HabitInterface) => ({
  goalName: getStoreItem(item, "goalStore", item.goal)?.title || "—",
  scheduleDefinition:
    getStoreItem(item, "scheduleStore", item.schedule)?.definition || "—",
});

export type HabitInterface = PropsToInterface<typeof props>;
export class Habit extends MyModel(keyName, props, derivedProps) {}
export class HabitStore extends MyStore(keyName, Habit, slug) {}
export const HabitFields: ViewFields<HabitInterface> = {
  datetimeFields: [
    "dateCreated",
    "dateStart",
    "dateEnd",
    "dateCompleted",
  ] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
