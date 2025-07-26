import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { MyModel, MyStore } from "./GenericStore";

const slug = "productivity/habit-logs/";
const keyName = "HabitLog";
const props = {
  id: prop<number | string>(-1),
  habit: prop<number | null>(null),
  dateCreated: prop<string>(""),
};

export type HabitLogInterface = PropsToInterface<typeof props>;
export class HabitLog extends MyModel(keyName, props) {}
export class HabitLogStore extends MyStore(keyName, HabitLog, slug) {}
export const HabitLogFields: ViewFields<HabitLogInterface> = {
  datetimeFields: ["dateCreated"] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
