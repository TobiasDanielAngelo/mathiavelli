import { computed } from "mobx";
import { Model, _async, _await, model, modelFlow, prop } from "mobx-keystone";
import {
  deleteItemRequest,
  fetchItemsRequest,
  postItemRequest,
  updateItemRequest,
} from "../constants/storeHelpers";

const slug = "buy-list-items";

const props = {
  id: prop<number>(-1),
  name: prop<string>(""),
  description: prop<string>(""),
  estimatedPrice: prop<number>(0),
  addedAt: prop<string>(""),
  plannedDate: prop<string>(""),
  priority: prop<number>(0),
  status: prop<number>(0),
};

export const PRIORITY_CHOICES = ["Low", "Medium", "High"];
export const WISHLIST_STATUS_CHOICES = ["Pending", "Bought", "Canceled"];

export type BuyListItemInterface = {
  [K in keyof typeof props]?: (typeof props)[K] extends ReturnType<
    typeof prop<infer T>
  >
    ? T
    : never;
};

export const BuyListItemFields: Record<string, (keyof BuyListItemInterface)[]> =
  {
    datetime: ["addedAt"] as const,
    date: ["plannedDate"] as const,
    prices: ["estimatedPrice"] as const,
  };

@model("myApp/BuyListItem")
export class BuyListItem extends Model(props) {
  update(details: BuyListItemInterface) {
    Object.assign(this, details);
  }

  get priorityName() {
    return PRIORITY_CHOICES.find((_, ind) => ind === this.priority) ?? "—";
  }
  get statusName() {
    return WISHLIST_STATUS_CHOICES.find((_, ind) => ind === this.status) ?? "—";
  }

  get $view() {
    return {
      ...this.$,
      priorityName:
        PRIORITY_CHOICES.find((_, ind) => ind === this.priority) ?? "—",
      statusName:
        WISHLIST_STATUS_CHOICES.find((_, ind) => ind === this.status) ?? "—",
    };
  }
}

@model("myApp/BuyListItemStore")
export class BuyListItemStore extends Model({
  items: prop<BuyListItem[]>(() => []),
}) {
  @computed
  get itemsSignature() {
    const keys = Object.keys(
      new BuyListItem({}).$
    ) as (keyof BuyListItemInterface)[];
    return this.items
      .map((item) => keys.map((key) => String(item[key])).join("|"))
      .join("::");
  }

  @computed
  get allItems() {
    const map = new Map<number, BuyListItem>();
    this.items.forEach((item) => map.set(item.id, item));
    return map;
  }

  @modelFlow
  fetchAll = _async(function* (this: BuyListItemStore, params?: string) {
    let result;

    try {
      result = yield* _await(fetchItemsRequest<BuyListItem>(slug, params));
    } catch (error) {
      alert(error);
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      return result;
    }

    result.data.forEach((s) => {
      if (!this.items.map((s) => s.id).includes(s.id)) {
        this.items.push(new BuyListItem(s));
      } else {
        this.items.find((t) => t.id === s.id)?.update(s);
      }
    });

    return result;
  });

  @modelFlow
  addItem = _async(function* (
    this: BuyListItemStore,
    details: BuyListItemInterface
  ) {
    let result;

    try {
      result = yield* _await(
        postItemRequest<BuyListItemInterface>(slug, details)
      );
    } catch (error) {
      alert(error);
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      return result;
    }

    const item = new BuyListItem(result.data);
    this.items.push(item);

    return { details: "", ok: true, data: item };
  });

  @modelFlow
  updateItem = _async(function* (
    this: BuyListItemStore,
    itemId: number,
    details: BuyListItemInterface
  ) {
    let result;

    try {
      result = yield* _await(
        updateItemRequest<BuyListItemInterface>(slug, itemId, details)
      );
    } catch (error) {
      alert(error);
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      return result;
    }

    this.allItems.get(result.data.id ?? -1)?.update(result.data);

    return { details: "", ok: true, data: result.data };
  });

  @modelFlow
  deleteItem = _async(function* (this: BuyListItemStore, itemId: number) {
    let result;

    try {
      result = yield* _await(deleteItemRequest(slug, itemId));
    } catch (error) {
      alert(error);
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
