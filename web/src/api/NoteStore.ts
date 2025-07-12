import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { MyModel, MyStore } from "./GenericStore";

const slug = "issues/notes/";
const keyName = "Note";
const props = {
  id: prop<number | string>(-1),
  title: prop<string>(""),
  body: prop<string>(""),
  file: prop<File | null>(null),
  createdAt: prop<string>(""),
  updatedAt: prop<string>(""),
};

export type NoteInterface = PropsToInterface<typeof props>;
export class Note extends MyModel(keyName, props) {}
export class NoteStore extends MyStore(keyName, Note, slug) {}
export const NoteFields: ViewFields<NoteInterface> = {
  datetimeFields: ["createdAt", "updatedAt"] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
