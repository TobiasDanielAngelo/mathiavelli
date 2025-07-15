import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { getStoreItem, MyModel, MyStore } from "./GenericStore";

const slug = "travel/items-to-bring/";
const keyName = "ItemToBring";
const props = {
  id: prop<number | string>(-1),
  inventoryItem: prop<number | null>(null),
  document: prop<number | null>(null),
  quantity: prop<number>(0),
  packed: prop<boolean>(false),
};

const derivedProps = (item: ItemToBringInterface) => ({
  inventoryItemName:
    getStoreItem(item, "personalItemStore", item.inventoryItem)?.name || "—",
  documentName:
    getStoreItem(item, "documentStore", item.document)?.title || "—",
});

export type ItemToBringInterface = PropsToInterface<typeof props>;
export class ItemToBring extends MyModel(keyName, props, derivedProps) {}
export class ItemToBringStore extends MyStore(keyName, ItemToBring, slug) {}
export const ItemToBringFields: ViewFields<ItemToBringInterface> = {
  datetimeFields: [] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
