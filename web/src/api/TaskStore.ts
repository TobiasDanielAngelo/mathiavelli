import { prop } from "mobx-keystone";
import moment from "moment";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { getStoreItem, MyModel, MyStore } from "./GenericStore";

export const FREQUENCY_CHOICES = [
  "None",
  "Daily",
  "Weekly",
  "Monthly",
  "Yearly",
];

const slug = "productivity/tasks/";
const keyName = "Task";
const props = {
  id: prop<number | string>(-1),
  title: prop<string>(""),
  description: prop<string>(""),
  goal: prop<number | null>(null),
  habit: prop<number | null>(null),
  schedule: prop<number | string | null>(null),
  importance: prop<number>(0),
  dueDate: prop<string>(""),
  dateCompleted: prop<string>(""),
  dateStart: prop<string>(""),
  dateEnd: prop<string>(""),
  dateCreated: prop<string>(""),
  isArchived: prop<boolean>(false),
};

const derivedProps = (item: TaskInterface) => ({
  goalTitle: getStoreItem(item, "goalStore", item.goal)?.title || "—",
  habitTitle: getStoreItem(item, "habitStore", item.habit)?.title || "—",
  scheduleDefinition:
    getStoreItem(item, "scheduleStore", item.schedule)?.name || "—",
  dateDuration: `${item.dateStart ? moment(item.dateStart).format("lll") : ""}${
    item.dateEnd ? " – " + moment(item.dateEnd).format("lll") : ""
  }`,
});

export type TaskInterface = PropsToInterface<typeof props>;
export class Task extends MyModel(keyName, props, derivedProps) {}
export class TaskStore extends MyStore(keyName, Task, slug) {}
export const TaskFields: ViewFields<TaskInterface> = {
  datetimeFields: [
    "dateCreated",
    "dateCompleted",
    "dateStart",
    "dateEnd",
  ] as const,
  dateFields: ["dueDate"] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
