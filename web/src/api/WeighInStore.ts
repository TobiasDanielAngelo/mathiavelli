import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { MyModel, MyStore } from "./GenericStore";

const slug = "health/weigh-ins";
const keyName = "WeighIn";
const props = {
  id: prop<number>(-1),
  weightKg: prop<number>(0),
  date: prop<string>(""),
};

export type WeighInInterface = PropsToInterface<typeof props>;
export class WeighIn extends MyModel(keyName, props) {}
export class WeighInStore extends MyStore(keyName, WeighIn, slug) {}
export const WeighInFields: ViewFields<WeighInInterface> = {
  datetimeFields: ["date"] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
