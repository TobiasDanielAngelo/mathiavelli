import { getRoot, prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { getStoreItem, MyModel, MyStore } from "./GenericStore";
import { Store } from "./Store";

export const STATUS_CHOICES = ["Open", "In Progress", "Closed"];
export const PRIORITY_CHOICES = ["Low", "Medium", "High"];

const slug = "issues/tickets";
const keyName = "Ticket";
const props = {
  id: prop<number>(-1),
  title: prop<string>(""),
  tags: prop<number[] | null>(null),
  description: prop<string>(""),
  status: prop<number>(0),
  priority: prop<number>(0),
  createdAt: prop<string>(""),
  updatedAt: prop<string>(""),
  assignedTo: prop<number | null>(null),
};

const derivedProps = (item: TicketInterface) => ({
  tagsName: item.tags?.map(
    (s) => getRoot<Store>(item)?.tagStore?.allItems.get(s)?.name ?? ""
  ),
  statusName: STATUS_CHOICES.find((_, ind) => ind === item.status) ?? "—",
  priorityName: PRIORITY_CHOICES.find((_, ind) => ind === item.priority) ?? "—",
  assignedToName:
    getStoreItem(item, "userStore", item.assignedTo)?.fullName || "—",
});

export type TicketInterface = PropsToInterface<typeof props>;
export class Ticket extends MyModel(keyName, props, derivedProps) {}
export class TicketStore extends MyStore(keyName, Ticket, slug) {}
export const TicketFields: ViewFields<TicketInterface> = {
  datetimeFields: ["createdAt", "updatedAt"] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
