import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { MyModel, MyStore } from "./GenericStore";

export const STATUS_CHOICES = ["Open", "In Progress", "Closed"];
export const PRIORITY_CHOICES = ["Low", "Medium", "High"];

const slug = "issues/tickets/";
const keyName = "Ticket";
const props = {
  id: prop<number | string>(-1),
  createdAt: prop<string>(""),
  updatedAt: prop<string>(""),
  title: prop<string>(""),
  tags: prop<number[] | null>(null),
  description: prop<string>(""),
  status: prop<number>(0),
  priority: prop<number>(0),
  assignedTo: prop<number | null>(null),
};

export type TicketInterface = PropsToInterface<typeof props>;
export class Ticket extends MyModel(keyName, props) {}
export class TicketStore extends MyStore(keyName, Ticket, slug) {}
export const TicketFields: ViewFields<TicketInterface> = {
  datetimeFields: ["createdAt", "updatedAt", "createdAt", "updatedAt"] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
