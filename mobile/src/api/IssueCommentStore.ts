import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { getStoreItem, MyModel, MyStore } from "./GenericStore";

const slug = "issues/comments/";
const keyName = "IssueComment";
const props = {
  id: prop<number | string>(-1),
  createdAt: prop<string>(""),
  updatedAt: prop<string>(""),
  ticket: prop<number | null>(null),
  user: prop<number | null>(null),
  content: prop<string>(""),
};

const derivedProps = (item: IssueCommentInterface) => ({
  ticketTitle: getStoreItem(item, "ticketStore", item.ticket)?.title || "—",
  userName: getStoreItem(item, "userStore", item.user)?.fullName || "—",
});

export type IssueCommentInterface = PropsToInterface<typeof props>;
export class IssueComment extends MyModel(keyName, props, derivedProps) {}
export class IssueCommentStore extends MyStore(keyName, IssueComment, slug) {}
export const IssueCommentFields: ViewFields<IssueCommentInterface> = {
  datetimeFields: ["createdAt", "updatedAt", "createdAt"] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
