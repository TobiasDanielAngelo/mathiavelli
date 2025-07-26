import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { MyModel, MyStore } from "./GenericStore";

export const PRIORITY_CHOICES = ["Low", "Medium", "High"];
export const WISHLIST_STATUS_CHOICES = ["Pending", "Bought", "Canceled"];

const slug = "finance/buy-list-items/";
const keyName = "BuyListItem";
const props = {
  id: prop<number | string>(-1),
  name: prop<string>(""),
  description: prop<string>(""),
  estimatedPrice: prop<number>(0),
  addedAt: prop<string>(""),
  plannedDate: prop<string>(""),
  priority: prop<number>(0),
  status: prop<number>(0),
};

export type BuyListItemInterface = PropsToInterface<typeof props>;
export class BuyListItem extends MyModel(keyName, props) {}
export class BuyListItemStore extends MyStore(keyName, BuyListItem, slug) {}
export const BuyListItemFields: ViewFields<BuyListItemInterface> = {
  datetimeFields: ["addedAt"] as const,
  dateFields: ["plannedDate"] as const,
  timeFields: [] as const,
  pricesFields: ["estimatedPrice"] as const,
};
