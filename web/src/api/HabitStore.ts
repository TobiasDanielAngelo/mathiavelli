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

const slug = "productivity/habits";

const props = {
  id: prop<number>(-1),
  title: prop<string>(""),
  description: prop<string>(""),
  goal: prop<number | null>(null),
  schedule: prop<number | null>(null),
  thresholdPercent: prop<number>(0),
  dateStart: prop<string>(""),
  dateEnd: prop<string>(""),
  dateCompleted: prop<string>(""),
  isArchived: prop<boolean>(false),
  dateCreated: prop<string>(""),
};

export type HabitInterface = {
  [K in keyof typeof props]?: (typeof props)[K] extends ReturnType<
    typeof prop<infer T>
  >
    ? T
    : never;
};

export const HabitFields: Record<string, (keyof HabitInterface)[]> = {
  datetimeFields: [
    "dateCreated",
    "dateStart",
    "dateEnd",
    "dateCompleted",
  ] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};

@model("myApp/Habit")
export class Habit extends Model(props) {
  update(details: HabitInterface) {
    Object.assign(this, details);
  }

  get goalName() {
    return (
      getRoot<Store>(this)?.goalStore?.allItems.get(this.goal ?? -1)?.title ||
      "—"
    );
  }
  get scheduleDefinition() {
    return (
      getRoot<Store>(this)?.scheduleStore?.allItems.get(this.schedule ?? -1)
        ?.definition || "—"
    );
  }

  get $view() {
    return {
      ...this.$,
      goalName:
        getRoot<Store>(this)?.goalStore?.allItems.get(this.goal ?? -1)?.title ||
        "—",
      scheduleDefinition:
        getRoot<Store>(this)?.scheduleStore?.allItems.get(this.schedule ?? -1)
          ?.definition || "—",
    };
  }
}

@model("myApp/HabitStore")
export class HabitStore extends Model({
  items: prop<Habit[]>(() => []),
}) {
  @computed
  get itemsSignature() {
    const keys = Object.keys(new Habit({}).$view) as (keyof HabitInterface)[];
    return this.items
      .map((item) => keys.map((key) => String(item[key])).join("|"))
      .join("::");
  }

  @computed
  get allItems() {
    const map = new Map<number, Habit>();
    this.items.forEach((item) => map.set(item.id, item));
    return map;
  }

  @modelFlow
  fetchAll = _async(function* (this: HabitStore, params?: string) {
    let result;

    try {
      result = yield* _await(fetchItemsRequest<Habit>(slug, params));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
      });
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
        this.items.push(new Habit(s));
      } else {
        this.items.find((t) => t.id === s.id)?.update(s);
      }
    });

    return result;
  });

  @modelFlow
  addItem = _async(function* (this: HabitStore, details: HabitInterface) {
    let result;

    try {
      result = yield* _await(postItemRequest<HabitInterface>(slug, details));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
      });
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

    const item = new Habit(result.data);
    this.items.push(item);

    return { details: "", ok: true, data: item };
  });

  @modelFlow
  updateItem = _async(function* (
    this: HabitStore,
    itemId: number,
    details: HabitInterface
  ) {
    let result;

    try {
      result = yield* _await(
        updateItemRequest<HabitInterface>(slug, itemId, details)
      );
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
      });
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
  deleteItem = _async(function* (this: HabitStore, itemId: number) {
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
