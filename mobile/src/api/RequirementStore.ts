import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { getStoreItem, MyModel, MyStore } from "./GenericStore";

const slug = "travel/requirements/";
const keyName = "Requirement";
const props = {
  id: prop<number | string>(-1),
  createdAt: prop<string>(""),
  updatedAt: prop<string>(""),
  plan: prop<number | null>(null),
  name: prop<string>(""),
  cost: prop<number>(0),
  completed: prop<boolean>(false),
};
const derivedProps = (item: RequirementInterface) => ({
  planName: getStoreItem(item, "travelPlanStore", item.plan)?.country || "—",
});
export type RequirementInterface = PropsToInterface<typeof props>;
export class Requirement extends MyModel(keyName, props, derivedProps) {}
export class RequirementStore extends MyStore(keyName, Requirement, slug) {}
export const RequirementFields: ViewFields<RequirementInterface> = {
  datetimeFields: ["createdAt", "updatedAt"] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: ["cost"] as const,
};
