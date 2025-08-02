import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { getStoreItem, MyModel, MyStore } from "./GenericStore";

export const PURPOSE_CHOICES = [
  "Work",
  "Study",
  "Vacation",
  "Relocation",
  "Other",
];
export const STATUS_CHOICES = [
  "Planning",
  "Booking",
  "Approved",
  "On Hold",
  "Completed",
];

const slug = "travel/travel-plans/";
const keyName = "TravelPlan";
const props = {
  id: prop<number | string>(-1),
  createdAt: prop<string>(""),
  updatedAt: prop<string>(""),
  itemsToBring: prop<number[] | null>(null),
  country: prop<string>(""),
  city: prop<string>(""),
  purpose: prop<number>(0),
  targetDate: prop<string>(""),
  status: prop<number>(0),
  notes: prop<string>(""),
};

const derivedProps = (item: TravelPlanInterface) => {
  const itemsToBring = (s: number | string) => {
    const i = getStoreItem(item, "itemToBringStore", s);
    if (i?.document) return i.documentName;
    if (i?.inventoryItem) return i.inventoryItemName;
  };
  return {
    itemsToBringName: item.itemsToBring?.map((s) => itemsToBring(s) ?? ""),
    purposeName: PURPOSE_CHOICES.find((_, ind) => ind === item.purpose) ?? "—",
    statusName: STATUS_CHOICES.find((_, ind) => ind === item.status) ?? "—",
  };
};

export type TravelPlanInterface = PropsToInterface<typeof props>;
export class TravelPlan extends MyModel(keyName, props, derivedProps) {}
export class TravelPlanStore extends MyStore(keyName, TravelPlan, slug) {}
export const TravelPlanFields: ViewFields<TravelPlanInterface> = {
  datetimeFields: ["createdAt", "updatedAt", "createdAt"] as const,
  dateFields: ["targetDate"] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
