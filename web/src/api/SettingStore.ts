import { modelAction, modelFlow, prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { functionBinder, MyModel, MyStore } from "./GenericStore";

export const SettingIdMap = {
  Theme: 1000001,
  UGW: 1000002,
  GW4: 1000003,
  GW3: 1000004,
  GW2: 1000005,
  GW1: 1000006,
} as const;

const slug = "settings/";
const keyName = "Setting";
const props = {
  id: prop<number | string>(-1),
  createdAt: prop<string>(""),
  updatedAt: prop<string>(""),
  key: prop<string>(""),
  value: prop<string>(""),
  description: prop<string>(""),
};

export type SettingInterface = PropsToInterface<typeof props>;
export class Setting extends MyModel(keyName, props) {}
export class SettingStore extends MyStore(keyName, Setting, slug) {
  constructor(args: any) {
    super(args);
    functionBinder(this);
  }

  @modelAction
  theme = function (this: SettingStore) {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const defaultTheme = prefersDark ? "dark" : "light";
    return (
      this.allItems.get(SettingIdMap.Theme)?.value ?? savedTheme ?? defaultTheme
    );
  };
  @modelFlow
  toggleTheme = async function (this: SettingStore) {
    const currentTheme = this.allItems.get(SettingIdMap.Theme)?.value;
    if (currentTheme) {
      const newTheme = currentTheme === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      this.updateItem(SettingIdMap.Theme, { value: newTheme });
    }
  };
}
export const SettingFields: ViewFields<SettingInterface> = {
  datetimeFields: ["createdAt", "updatedAt"] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
