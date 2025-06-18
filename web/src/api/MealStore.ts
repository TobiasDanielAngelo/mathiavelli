import { computed } from "mobx";
import { Model, _async, _await, model, modelFlow, prop } from "mobx-keystone";
import {
  deleteItemRequest,
  fetchItemsRequest,
  postItemRequest,
  updateItemRequest,
} from "../constants/storeHelpers";
import Swal from "sweetalert2";

const slug = "meals";

const props = {
  id: prop<number>(-1),
  name: prop<string>(""),
  category: prop<number>(0),
  calories: prop<number>(0),
  date: prop<string>(""),
};

export const MEAL_CATEGORY_CHOICES = ["Breakfast", "Lunch", "Dinner", "Snack"];

export type MealInterface = {
  [K in keyof typeof props]?: (typeof props)[K] extends ReturnType<
    typeof prop<infer T>
  >
    ? T
    : never;
};

export const MealFields: Record<string, (keyof MealInterface)[]> = {
  datetime: ["date"] as const,
  date: [] as const,
  time: [] as const,
  prices: [] as const,
};

@model("myApp/Meal")
export class Meal extends Model(props) {
  update(details: MealInterface) {
    Object.assign(this, details);
  }

  get categoryName() {
    return MEAL_CATEGORY_CHOICES.find((_, ind) => ind === this.category) ?? "—";
  }

  get $view() {
    return {
      ...this.$,
      categoryName:
        MEAL_CATEGORY_CHOICES.find((_, ind) => ind === this.category) ?? "—",
    };
  }
}

@model("myApp/MealStore")
export class MealStore extends Model({
  items: prop<Meal[]>(() => []),
}) {
  @computed
  get itemsSignature() {
    const keys = Object.keys(new Meal({}).$) as (keyof MealInterface)[];
    return this.items
      .map((item) => keys.map((key) => String(item[key])).join("|"))
      .join("::");
  }

  @computed
  get allItems() {
    const map = new Map<number, Meal>();
    this.items.forEach((item) => map.set(item.id, item));
    return map;
  }

  @modelFlow
  fetchAll = _async(function* (this: MealStore, params?: string) {
    let result;

    try {
      result = yield* _await(fetchItemsRequest<Meal>(slug, params));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
      });
      error;
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      return result;
    }

    result.data.forEach((s) => {
      if (!this.items.map((s) => s.id).includes(s.id)) {
        this.items.push(new Meal(s));
      } else {
        this.items.find((t) => t.id === s.id)?.update(s);
      }
    });

    return result;
  });

  @modelFlow
  addItem = _async(function* (this: MealStore, details: MealInterface) {
    let result;

    try {
      result = yield* _await(postItemRequest<MealInterface>(slug, details));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
      });
      error;
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      return result;
    }

    const item = new Meal(result.data);
    this.items.push(item);

    return { details: "", ok: true, data: item };
  });

  @modelFlow
  updateItem = _async(function* (
    this: MealStore,
    itemId: number,
    details: MealInterface
  ) {
    let result;

    try {
      result = yield* _await(
        updateItemRequest<MealInterface>(slug, itemId, details)
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
      return result;
    }

    this.allItems.get(result.data.id ?? -1)?.update(result.data);

    return { details: "", ok: true, data: result.data };
  });

  @modelFlow
  deleteItem = _async(function* (this: MealStore, itemId: number) {
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
