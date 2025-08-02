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
  id: prop<number | string>(-1),
  createdAt: prop<string>(""),
  updatedAt: prop<string>(""),
  title: prop<string>(""),
  company: prop<string>(""),
  location: prop<string>(""),
  link: prop<string>(""),
  salary: prop<string>(""),
  deadline: prop<string>(""),
  appliedDate: prop<string>(""),
  notes: prop<string>(""),
  source: prop<number>(0),
  status: prop<number>(0),
  workSetup: prop<number>(0),
  jobType: prop<number>(0),
};

export type JobInterface = PropsToInterface<typeof props>;
export class Job extends MyModel(keyName, props) {}
export class JobStore extends MyStore(keyName, Job, slug) {}
export const JobFields: ViewFields<JobInterface> = {
  datetimeFields: ["createdAt", "updatedAt", "createdAt", "updatedAt"] as const,
  dateFields: ["deadline", "appliedDate"] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
