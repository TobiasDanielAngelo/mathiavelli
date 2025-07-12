import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { MyModel, MyStore } from "./GenericStore";

export const STATUS_CHOICES = [
  "Wishlist",
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
  "Accepted",
];
export const SOURCE_CHOICES = [
  "Walk-in",
  "LinkedIn",
  "Indeed",
  "Glassdoor",
  "JobStreet",
  "Referral",
  "Company Website",
  "Facebook",
  "Twitter / X",
  "Other",
];
export const WORK_SETUP_CHOICES = ["On-site", "Remote", "Hybrid"];
export const JOB_TYPE_CHOICES = [
  "Full-time",
  "Part-time",
  "Freelance",
  "Contract",
  "Internship",
  "Temporary",
];

const slug = "career/jobs/";
const keyName = "Job";
const props = {
  id: prop<number>(-1),
  title: prop<string>(""),
  company: prop<string>(""),
  location: prop<string>(""),
  link: prop<string>(""),
  salary: prop<string>(""),
  deadline: prop<string>(""),
  appliedDate: prop<string>(""),
  notes: prop<string>(""),
  createdAt: prop<string>(""),
  updatedAt: prop<string>(""),
  source: prop<number>(0),
  status: prop<number>(0),
  workSetup: prop<number>(0),
  jobType: prop<number>(0),
};

const derivedProps = (item: JobInterface) => ({
  sourceName: SOURCE_CHOICES.find((_, ind) => ind === item.source) ?? "—",
  statusName: STATUS_CHOICES.find((_, ind) => ind === item.status) ?? "—",
  workSetupName:
    WORK_SETUP_CHOICES.find((_, ind) => ind === item.workSetup) ?? "—",
  jobTypeName: JOB_TYPE_CHOICES.find((_, ind) => ind === item.jobType) ?? "—",
});

export type JobInterface = PropsToInterface<typeof props>;
export class Job extends MyModel(keyName, props, derivedProps) {}
export class JobStore extends MyStore(keyName, Job, slug) {}
export const JobFields: ViewFields<JobInterface> = {
  datetimeFields: ["createdAt", "updatedAt"] as const,
  dateFields: ["deadline", "appliedDate"] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
