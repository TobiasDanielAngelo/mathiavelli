import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { MyModel, MyStore } from "./GenericStore";

const slug = "travel/items-to-bring/";
const keyName = "ItemToBring";
const props = {
  id: prop<number | string>(-1),
  createdAt: prop<string>(""),
  updatedAt: prop<string>(""),
  inventoryItem: prop<number | null>(null),
  document: prop<number | null>(null),
  quantity: prop<number>(0),
  packed: prop<boolean>(false),
};

export type ItemToBringInterface = PropsToInterface<typeof props>;
export class ItemToBring extends MyModel(keyName, props) {}
export class ItemToBringStore extends MyStore(keyName, ItemToBring, slug) {}
export const ItemToBringFields: ViewFields<ItemToBringInterface> = {
  datetimeFields: ["createdAt", "updatedAt"] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
