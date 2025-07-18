import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { MyModel, MyStore } from "./GenericStore";

const slug = "personal/platforms/";
const keyName = "Platform";
const props = {
  id: prop<number | string>(-1),
  name: prop<string>(""),
};

export type PlatformInterface = PropsToInterface<typeof props>;
export class Platform extends MyModel(keyName, props) {}
export class PlatformStore extends MyStore(keyName, Platform, slug) {}
export const PlatformFields: ViewFields<PlatformInterface> = {
  datetimeFields: [] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
