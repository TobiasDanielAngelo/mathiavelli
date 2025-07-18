import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { getStoreItem, MyModel, MyStore } from "./GenericStore";

export const FOLLOWUP_STATUS_CHOICES = [
  "No Response",
  "Initial Follow-up",
  "Reminder Email",
  "Thank You Note",
  "Checking for Updates",
  "Interview Scheduled",
  "Got a Response",
];

const slug = "career/follow-ups/";
const keyName = "FollowUp";
const props = {
  id: prop<number | string>(-1),
  job: prop<number | null>(null),
  date: prop<string>(""),
  message: prop<string>(""),
  status: prop<number>(0),
  reply: prop<string>(""),
};

const derivedProps = (item: FollowUpInterface) => ({
  jobTitle: getStoreItem(item, "jobStore", item.job)?.title || "—",
  statusName:
    FOLLOWUP_STATUS_CHOICES.find((_, ind) => ind === item.status) ?? "—",
});

export type FollowUpInterface = PropsToInterface<typeof props>;
export class FollowUp extends MyModel(keyName, props, derivedProps) {}
export class FollowUpStore extends MyStore(keyName, FollowUp, slug) {}
export const FollowUpFields: ViewFields<FollowUpInterface> = {
  datetimeFields: [] as const,
  dateFields: ["date"] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
