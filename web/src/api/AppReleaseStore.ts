import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { MyModel, MyStore } from "./GenericStore";

const slug = "issues/app-releases/";
const keyName = "AppReleases";
const props = {
  id: prop<number | string>(-1),
  createdAt: prop<string>(""),
  updatedAt: prop<string>(""),
  title: prop<string>(""),
  description: prop<string>(""),
  file: prop<File | null>(null),
};

export type AppReleaseInterface = PropsToInterface<typeof props>;
export class AppRelease extends MyModel(keyName, props) {}
export class AppReleaseStore extends MyStore(keyName, AppRelease, slug) {}

export const AppReleaseFields: ViewFields<AppReleaseInterface> = {
  datetimeFields: ["createdAt", "updatedAt"] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
