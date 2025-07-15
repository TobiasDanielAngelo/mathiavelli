import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { MyModel, MyStore } from "./GenericStore";

const slug = "personal/dreams/";
const keyName = "Dream";
const props = {
  id: prop<number | string>(-1),
  entry: prop<string>(""),
  dateCreated: prop<string>(""),
};

export type DreamInterface = PropsToInterface<typeof props>;
export class Dream extends MyModel(keyName, props) {}
export class DreamStore extends MyStore(keyName, Dream, slug) {}
export const DreamFields: ViewFields<DreamInterface> = {
  datetimeFields: [] as const,
  dateFields: ["dateCreated"] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
