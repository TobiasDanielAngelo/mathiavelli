import {
  Model,
  _async,
  _await,
  getRoot,
  model,
  modelFlow,
  prop,
} from "mobx-keystone";
import { computed } from "mobx";
import {
  deleteItemRequest,
  fetchItemsRequest,
  postItemRequest,
  updateItemRequest,
} from "./_apiHelpers";
import { Store } from "./Store";
import Swal from "sweetalert2";

const slug = "productivity/habit-logs";

const props = {
  id: prop<number>(-1),
  habit: prop<number | null>(null),
  dateCreated: prop<string>(""),
};

export type HabitLogInterface = {
  [K in keyof typeof props]?: (typeof props)[K] extends ReturnType<
    typeof prop<infer T>
  >
    ? T
    : never;
};

export const HabitLogFields: Record<string, (keyof HabitLogInterface)[]> = {
  datetime: ["dateCreated"] as const,
  date: [] as const,
  time: [] as const,
  prices: [] as const,
};

@model("myApp/HabitLog")
export class HabitLog extends Model(props) {
  update(details: HabitLogInterface) {
    Object.assign(this, details);
  }

  get habitName() {
    return (
      getRoot<Store>(this)?.habitStore?.allItems.get(this.habit ?? -1)?.title ||
      "—"
    );
  }

  get $view() {
    return {
      ...this.$,
      habitName:
        getRoot<Store>(this)?.habitStore?.allItems.get(this.habit ?? -1)
          ?.title || "—",
    };
  }
}

@model("myApp/HabitLogStore")
export class HabitLogStore extends Model({
  items: prop<HabitLog[]>(() => []),
}) {
  @computed
  get itemsSignature() {
    const keys = Object.keys(new HabitLog({}).$) as (keyof HabitLogInterface)[];
    return this.items
      .map((item) => keys.map((key) => String(item[key])).join("|"))
      .join("::");
  }

  @computed
  get allItems() {
    const map = new Map<number, HabitLog>();
    this.items.forEach((item) => map.set(item.id, item));
    return map;
  }

  @modelFlow
  fetchAll = _async(function* (this: HabitLogStore, params?: string) {
    let result;

    try {
      result = yield* _await(fetchItemsRequest<HabitLog>(slug, params));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
      });
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      return result;
    }

    result.data.forEach((s) => {
      if (!this.items.map((s) => s.id).includes(s.id)) {
        this.items.push(new HabitLog(s));
      } else {
        this.items.find((t) => t.id === s.id)?.update(s);
      }
    });

    return result;
  });

  @modelFlow
  addItem = _async(function* (this: HabitLogStore, details: HabitLogInterface) {
    let result;

    try {
      result = yield* _await(postItemRequest<HabitLogInterface>(slug, details));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
      });
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      return result;
    }

    const item = new HabitLog(result.data);
    this.items.push(item);

    return { details: "", ok: true, data: item };
  });

  @modelFlow
  updateItem = _async(function* (
    this: HabitLogStore,
    itemId: number,
    details: HabitLogInterface
  ) {
    let result;

    try {
      result = yield* _await(
        updateItemRequest<HabitLogInterface>(slug, itemId, details)
      );
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
      });
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      return result;
    }

    this.allItems.get(result.data.id ?? -1)?.update(result.data);

    return { details: "", ok: true, data: result.data };
  });

  @modelFlow
  deleteItem = _async(function* (this: HabitLogStore, itemId: number) {
    let result;

    try {
      result = yield* _await(deleteItemRequest(slug, itemId));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
      });
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
