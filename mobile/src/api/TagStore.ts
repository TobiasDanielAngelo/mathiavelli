import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { MyModel, MyStore } from "./GenericStore";

const slug = "productivity/tags/";
const keyName = "Tag";
const props = {
  id: prop<number | string>(-1),
  createdAt: prop<string>(""),
  updatedAt: prop<string>(""),
  name: prop<string>(""),
  color: prop<string>(""),
};

export type TagInterface = PropsToInterface<typeof props>;
export class Tag extends MyModel(keyName, props) {}
export class TagStore extends MyStore(keyName, Tag, slug) {}
export const TagFields: ViewFields<TagInterface> = {
  datetimeFields: ["createdAt", "updatedAt"] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
