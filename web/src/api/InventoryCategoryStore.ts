import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { MyModel, MyStore } from "./GenericStore";

const slug = "finance/inventory-categories/";
const keyName = "InventoryCategory";
const props = {
  id: prop<number>(-1),
  name: prop<string>(""),
};

export type InventoryCategoryInterface = PropsToInterface<typeof props>;
export class InventoryCategory extends MyModel(keyName, props) {}
export class InventoryCategoryStore extends MyStore(
  keyName,
  InventoryCategory,
  slug
) {}
export const InventoryCategoryFields: ViewFields<InventoryCategoryInterface> = {
  datetimeFields: [] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
