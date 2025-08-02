import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { MyModel, MyStore } from "./GenericStore";

const slug = "personal/journals/";
const keyName = "Journal";
const props = {
  id: prop<number | string>(-1),
  createdAt: prop<string>(""),
  updatedAt: prop<string>(""),
  title: prop<string>(""),
  description: prop<string>(""),
};

export type JournalInterface = PropsToInterface<typeof props>;
export class Journal extends MyModel(keyName, props) {}
export class JournalStore extends MyStore(keyName, Journal, slug) {}
export const JournalFields: ViewFields<JournalInterface> = {
  datetimeFields: ["createdAt", "updatedAt", "createdAt"] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
