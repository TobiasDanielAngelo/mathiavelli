import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { MyModel, MyStore } from "./GenericStore";

const slug = "issues/tags/";
const keyName = "issueTag";
const props = {
  id: prop<number | string>(-1),
  name: prop<string>(""),
};

export type IssueTagInterface = PropsToInterface<typeof props>;
export class IssueTag extends MyModel(keyName, props) {}
export class IssueTagStore extends MyStore(keyName, IssueTag, slug) {}
export const IssueTagFields: ViewFields<IssueTagInterface> = {
  datetimeFields: [] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
