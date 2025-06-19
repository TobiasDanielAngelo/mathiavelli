import { computed } from "mobx";
import { Model, _async, _await, model, modelFlow, prop } from "mobx-keystone";
import {
  deleteItemRequest,
  fetchItemsRequest,
  postItemRequest,
  updateItemRequest,
} from "./_apiHelpers";
import Swal from "sweetalert2";

const slug = "categories";

const props = {
  id: prop<number>(-1),
  title: prop<string>(""),
  nature: prop<number>(0),
  logo: prop<string>(""),
};

export const CATEGORY_CHOICES = [
  "Expense",
  "Income",
  "Transfer",
  "Payable",
  "Receivable",
];

export type CategoryInterface = {
  [K in keyof typeof props]?: (typeof props)[K] extends ReturnType<
    typeof prop<infer T>
  >
    ? T
    : never;
};

export const CategoryFields: Record<string, (keyof CategoryInterface)[]> = {
  datetime: [] as const,
  date: [] as const,
  time: [] as const,
  prices: [] as const,
};

@model("myApp/Category")
export class Category extends Model(props) {
  update(details: CategoryInterface) {
    Object.assign(this, details);
  }

  get natureName() {
    return CATEGORY_CHOICES.find((_, ind) => ind === this.nature) ?? "—";
  }

  get $view() {
    return {
      ...this.$,
      natureName: CATEGORY_CHOICES.find((_, ind) => ind === this.nature) ?? "—",
    };
  }
}

@model("myApp/CategoryStore")
export class CategoryStore extends Model({
  items: prop<Category[]>(() => []),
}) {
  @computed
  get itemsSignature() {
    const keys = Object.keys(new Category({}).$) as (keyof CategoryInterface)[];
    return this.items
      .map((item) => keys.map((key) => String(item[key])).join("|"))
      .join("::");
  }

  @computed
  get allItems() {
    const map = new Map<number, Category>();
    this.items.forEach((item) => map.set(item.id, item));
    return map;
  }

  @modelFlow
  fetchAll = _async(function* (this: CategoryStore, params?: string) {
    let result;

    try {
      result = yield* _await(fetchItemsRequest<Category>(slug, params));
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
        this.items.push(new Category(s));
      } else {
        this.items.find((t) => t.id === s.id)?.update(s);
      }
    });

    return result;
  });

  @modelFlow
  addItem = _async(function* (this: CategoryStore, details: CategoryInterface) {
    let result;

    try {
      result = yield* _await(postItemRequest<CategoryInterface>(slug, details));
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

    const item = new Category(result.data);
    this.items.push(item);

    return { details: "", ok: true, data: item };
  });

  @modelFlow
  updateItem = _async(function* (
    this: CategoryStore,
    itemId: number,
    details: CategoryInterface
  ) {
    let result;

    try {
      result = yield* _await(
        updateItemRequest<CategoryInterface>(slug, itemId, details)
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
  deleteItem = _async(function* (this: CategoryStore, itemId: number) {
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
