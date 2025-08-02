import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { MyModel, MyStore } from "./GenericStore";

const slug = "productivity/habit-logs/";
const keyName = "HabitLog";
const props = {
  id: prop<number | string>(-1),
  createdAt: prop<string>(""),
  updatedAt: prop<string>(""),
  habit: prop<number | null>(null),
};

export type HabitLogInterface = PropsToInterface<typeof props>;
export class HabitLog extends MyModel(keyName, props) {}
export class HabitLogStore extends MyStore(keyName, HabitLog, slug) {}
export const HabitLogFields: ViewFields<HabitLogInterface> = {
  datetimeFields: ["createdAt", "updatedAt"] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
