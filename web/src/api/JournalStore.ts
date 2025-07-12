import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { MyModel, MyStore } from "./GenericStore";

const slug = "personal/journals/";
const keyName = "Journal";
const props = {
  id: prop<number>(-1),
  title: prop<string>(""),
  description: prop<string>(""),
  datetimeCreated: prop<string>(""),
};

export type JournalInterface = PropsToInterface<typeof props>;
export class Journal extends MyModel(keyName, props) {}
export class JournalStore extends MyStore(keyName, Journal, slug) {}
export const JournalFields: ViewFields<JournalInterface> = {
  datetimeFields: ["datetimeCreated"] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
