import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { MyModel, MyStore } from "./GenericStore";

const slug = "finance/personal-items/";
const keyName = "PersonalItem";
const props = {
  id: prop<number | string>(-1),
  createdAt: prop<string>(""),
  updatedAt: prop<string>(""),
  name: prop<string>(""),
  category: prop<number | null>(null),
  location: prop<string>(""),
  quantity: prop<number>(0),
  acquiredDate: prop<string>(""),
  worth: prop<number>(0),
  notes: prop<string>(""),
  isImportant: prop<boolean>(false),
};

export type PersonalItemInterface = PropsToInterface<typeof props>;
export class PersonalItem extends MyModel(keyName, props) {}
export class PersonalItemStore extends MyStore(keyName, PersonalItem, slug) {}
export const PersonalItemFields: ViewFields<PersonalItemInterface> = {
  datetimeFields: ["createdAt", "updatedAt"] as const,
  dateFields: ["acquiredDate"] as const,
  timeFields: [] as const,
  pricesFields: ["worth"] as const,
};
