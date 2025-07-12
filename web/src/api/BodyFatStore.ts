import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { MyModel, MyStore } from "./GenericStore";

const slug = "health/body-fats";
const keyName = "BodyFat";
const props = {
  id: prop<number>(-1),
  bodyFatPercent: prop<number>(0),
  date: prop<string>(""),
};

export type BodyFatInterface = PropsToInterface<typeof props>;
export class BodyFat extends MyModel(keyName, props) {}
export class BodyFatStore extends MyStore(keyName, BodyFat, slug) {}

export const BodyFatFields: ViewFields<BodyFatInterface> = {
  datetimeFields: ["date"] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
