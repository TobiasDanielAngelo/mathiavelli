import { computed } from "mobx";
import { Model, _async, _await, model, modelFlow, prop } from "mobx-keystone";
import {
  deleteItemRequest,
  fetchItemsRequest,
  postItemRequest,
  updateItemRequest,
} from "./_apiHelpers";
import Swal from "sweetalert2";
import { SettingIdMap } from "../components/modules/SettingComponents";

const slug = "settings";

const props = {
  id: prop<number>(-1),
  key: prop<string>(""),
  value: prop<string>(""),
  description: prop<string>(""),
};

export type SettingInterface = {
  [K in keyof typeof props]?: (typeof props)[K] extends ReturnType<
    typeof prop<infer T>
  >
    ? T
    : never;
};

export const SettingFields: Record<string, (keyof SettingInterface)[]> = {
  datetimeFields: [] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};

@model("myApp/Setting")
export class Setting extends Model(props) {
  update(details: SettingInterface) {
    Object.assign(this, details);
  }

  get $view() {
    return {
      ...this.$,
    };
  }
}

@model("myApp/SettingStore")
export class SettingStore extends Model({
  items: prop<Setting[]>(() => []),
  itemsLoaded: prop<boolean>(false),
}) {
  @computed
  get itemsSignature() {
    const keys = Object.keys(new Setting({}).$) as (keyof SettingInterface)[];
    return this.items
      .map((item) => keys.map((key) => String(item[key])).join("|"))
      .join("::");
  }

  @computed
  get theme() {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const defaultTheme = prefersDark ? "dark" : "light";
    return (
      this.allItems.get(SettingIdMap.Theme)?.value ?? savedTheme ?? defaultTheme
    );
  }

  @computed
  get allItems() {
    const map = new Map<number, Setting>();
    this.items.forEach((item) => map.set(item.id, item));
    return map;
  }

  @modelFlow
  fetchAll = _async(function* (this: SettingStore, params?: string) {
    let result;

    try {
      result = yield* _await(fetchItemsRequest<Setting>(slug, params));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
      });
      error;
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      Swal.fire({
        icon: "error",
        title: "An error has occurred.",
      });

      if (!result.ok || !result.data) {
        return { details: "An error has occurred", ok: false, data: null };
      }
    }

    result.data.forEach((s) => {
      if (!this.items.map((s) => s.id).includes(s.id)) {
        this.items.push(new Setting(s));
      } else {
        this.items.find((t) => t.id === s.id)?.update(s);
      }
    });

    this.itemsLoaded = true;

    return result;
  });

  @modelFlow
  addItem = _async(function* (this: SettingStore, details: SettingInterface) {
    let result;

    try {
      result = yield* _await(postItemRequest<SettingInterface>(slug, details));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
      });
      error;
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      Swal.fire({
        icon: "error",
        title: "An error has occurred.",
      });

      if (!result.ok || !result.data) {
        return { details: "An error has occurred", ok: false, data: null };
      }
    }

    const item = new Setting(result.data);
    this.items.push(item);

    return { details: "", ok: true, data: item };
  });

  @modelFlow
  updateItem = _async(function* (
    this: SettingStore,
    itemId: number,
    details: SettingInterface
  ) {
    let result;

    try {
      result = yield* _await(
        updateItemRequest<SettingInterface>(slug, itemId, details)
      );
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
      });
      error;
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      Swal.fire({
        icon: "error",
        title: "An error has occurred.",
      });

      if (!result.ok || !result.data) {
        return { details: "An error has occurred", ok: false, data: null };
      }
    }

    this.allItems.get(result.data.id ?? -1)?.update(result.data);

    return { details: "", ok: true, data: result.data };
  });

  @modelFlow
  toggleTheme = _async(function* (this: SettingStore) {
    const currentTheme = this.allItems.get(SettingIdMap.Theme)?.value;
    if (currentTheme) {
      const newTheme = currentTheme === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      this.updateItem(SettingIdMap.Theme, { value: newTheme });
    }
  });

  @modelFlow
  deleteItem = _async(function* (this: SettingStore, itemId: number) {
    let result;

    try {
      result = yield* _await(deleteItemRequest(slug, itemId));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
      });
      error;
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok) {
      return result;
    }

    const indexOfItem = this.items.findIndex((s) => s.id === itemId);
    if (indexOfItem !== -1) {
      this.items.splice(indexOfItem, 1);
    }

    return result;
  });
}
