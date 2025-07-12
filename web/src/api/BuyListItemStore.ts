import { prop } from "mobx-keystone";
import { PropsToInterface } from "../constants/interfaces";
import { MyModel, MyStore } from "./GenericStore";

export const PRIORITY_CHOICES = ["Low", "Medium", "High"];
export const WISHLIST_STATUS_CHOICES = ["Pending", "Bought", "Canceled"];

const keyName = "BuyListItem";
const slug = "finance/buy-list-items";
const props = {
  id: prop<number>(-1),
  name: prop<string>(""),
  description: prop<string>(""),
  estimatedPrice: prop<number>(0),
  addedAt: prop<string>(""),
  plannedDate: prop<string>(""),
  priority: prop<number>(0),
  status: prop<number>(0),
};

const derivedProps = (item: BuyListItemInterface) => ({
  priorityName: PRIORITY_CHOICES.find((_, ind) => ind === item.priority) ?? "—",
  statusName:
    WISHLIST_STATUS_CHOICES.find((_, ind) => ind === item.status) ?? "—",
});

export type BuyListItemInterface = PropsToInterface<typeof props>;
export class BuyListItem extends MyModel(keyName, props, derivedProps) {}
export class BuyListItemStore extends MyStore(keyName, BuyListItem, slug) {}
export const BuyListItemFields: Record<string, (keyof BuyListItemInterface)[]> =
  {
    datetimeFields: ["addedAt"] as const,
    dateFields: ["plannedDate"] as const,
    timeFields: [] as const,
    pricesFields: ["estimatedPrice"] as const,
  };
