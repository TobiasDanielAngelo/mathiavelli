import { prop } from "mobx-keystone";
import moment from "moment";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { getStoreItem, MyModel, MyStore } from "./GenericStore";

const slug = "productivity/events/";
const keyName = "Event";
const props = {
  id: prop<number>(-1),
  title: prop<string>(""),
  description: prop<string>(""),
  dateStart: prop<string>(""),
  dateEnd: prop<string>(""),
  dateCompleted: prop<string>(""),
  isArchived: prop<boolean>(false),
  location: prop<string>(""),
  tags: prop<number[] | null>(null),
  dateCreated: prop<string>(""),
  task: prop<number | null>(null),
  excuse: prop<string>(""),
};

const derivedProps = (item: EventInterface) => ({
  tagsName: item.tags?.map(
    (s) => getStoreItem(item, "tagStore", s)?.name ?? "—"
  ),
  taskTitle: getStoreItem(item, "taskStore", item.task)?.title ?? "—",
  dateDuration: `${moment(item.dateStart).format("lll")}${
    item.dateEnd ? " – " + moment(item.dateEnd).format("lll") : "—"
  }`,
});

export type EventInterface = PropsToInterface<typeof props>;
export class Event extends MyModel(keyName, props, derivedProps) {}
export class EventStore extends MyStore(keyName, Event, slug) {}
export const EventFields: ViewFields<EventInterface> = {
  datetimeFields: [
    "dateStart",
    "dateEnd",
    "dateCreated",
    "dateCompleted",
  ] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
