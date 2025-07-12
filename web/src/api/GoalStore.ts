import { prop } from "mobx-keystone";
import moment from "moment";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { MyModel, MyStore } from "./GenericStore";

const slug = "productivity/goals/";
const keyName = "Goal";
const props = {
  id: prop<number>(-1),
  title: prop<string>(""),
  description: prop<string>(""),
  parentGoal: prop<number | null>(null),
  dateCompleted: prop<string>(""),
  dateStart: prop<string>(""),
  dateEnd: prop<string>(""),
  dateCreated: prop<string>(""),
  isArchived: prop<boolean>(false),
};

const derivedProps = (item: GoalInterface) => ({
  dateDuration: `${item.dateStart ? moment(item.dateStart).format("lll") : ""}${
    item.dateEnd ? " – " + moment(item.dateEnd).format("lll") : ""
  }`,
});

export type GoalInterface = PropsToInterface<typeof props>;
export class Goal extends MyModel(keyName, props, derivedProps) {}
export class GoalStore extends MyStore(keyName, Goal, slug) {}

export const GoalFields: ViewFields<GoalInterface> = {
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
