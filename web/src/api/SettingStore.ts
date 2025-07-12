import { modelAction, prop } from "mobx-keystone";
import { SettingIdMap } from "../components/modules/SettingComponents";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { MyModel, MyStore } from "./GenericStore";

const slug = "settings";
const keyName = "Setting";
const props = {
  id: prop<number>(-1),
  key: prop<string>(""),
  value: prop<string>(""),
  description: prop<string>(""),
};

export type SettingInterface = PropsToInterface<typeof props>;
export class Setting extends MyModel(keyName, props) {}
export class SettingStore extends MyStore(keyName, Setting, slug) {
  constructor(args: any) {
    super(args);
    this.toggleTheme = this.toggleTheme.bind(this);
    this.theme = this.theme.bind(this);
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
  @modelAction
  toggleTheme = function (this: SettingStore) {
    const currentTheme = this.allItems.get(SettingIdMap.Theme)?.value;
    if (currentTheme) {
      const newTheme = currentTheme === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      this.updateItem(SettingIdMap.Theme, { value: newTheme });
    }
  };
}
export const SettingFields: ViewFields<SettingInterface> = {
  datetimeFields: [] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
