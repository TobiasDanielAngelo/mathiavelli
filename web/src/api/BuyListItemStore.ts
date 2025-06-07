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
  estimatedPrice: prop<number>(0),
  addedAt: prop<string>(""),
  plannedDate: prop<string>(""),
  priority: prop<number | null>(null),
  status: prop<number | null>(null),
};

export type BuyListItemInterface = {
  [K in keyof typeof props]?: (typeof props)[K] extends ReturnType<
    typeof prop<infer T>
  >
    ? T
    : never;
};

@model("myApp/BuyListItem")
export class BuyListItem extends Model(props) {
  update(details: BuyListItemInterface) {
    Object.assign(this, details);
  }
  get $view() {
    return {
      ...this.$,
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
