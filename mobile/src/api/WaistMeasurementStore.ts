import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { MyModel, MyStore } from "./GenericStore";

const slug = "health/waist-measurements/";
const keyName = "WaistMeasurement";
const props = {
  id: prop<number | string>(-1),
  createdAt: prop<string>(""),
  updatedAt: prop<string>(""),
  waistCm: prop<number>(0),
  date: prop<string>(""),
};

export type WaistMeasurementInterface = PropsToInterface<typeof props>;
export class WaistMeasurement extends MyModel(keyName, props) {}
export class WaistMeasurementStore extends MyStore(
  keyName,
  WaistMeasurement,
  slug
) {}
export const WaistMeasurementFields: ViewFields<WaistMeasurementInterface> = {
  datetimeFields: ["createdAt", "updatedAt", "date"] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
