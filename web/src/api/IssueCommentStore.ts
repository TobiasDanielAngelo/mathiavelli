import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { MyModel, MyStore } from "./GenericStore";

const slug = "issues/comments/";
const keyName = "IssueComment";
const props = {
  id: prop<number | string>(-1),
  ticket: prop<number | null>(null),
  user: prop<number | null>(null),
  content: prop<string>(""),
  createdAt: prop<string>(""),
};

export type IssueCommentInterface = PropsToInterface<typeof props>;
export class IssueComment extends MyModel(keyName, props) {}
export class IssueCommentStore extends MyStore(keyName, IssueComment, slug) {}
export const IssueCommentFields: ViewFields<IssueCommentInterface> = {
  datetimeFields: ["createdAt"] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
