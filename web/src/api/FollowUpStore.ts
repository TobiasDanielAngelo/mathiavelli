import { computed } from "mobx";
import { Model, _async, _await, model, modelFlow, prop } from "mobx-keystone";
import {
  deleteItemRequest,
  fetchItemsRequest,
  postItemRequest,
  updateItemRequest,
} from "../constants/storeHelpers";

const slug = "follow-ups";

const props = {
  id: prop<number>(-1),
  job: prop<number | null>(null),
  date: prop<string>(""),
  message: prop<string>(""),
  status: prop<number | null>(null),
  reply: prop<string>(""),
};

export type FollowUpInterface = {
  [K in keyof typeof props]?: (typeof props)[K] extends ReturnType<
    typeof prop<infer T>
  >
    ? T
    : never;
};

@model("myApp/FollowUp")
export class FollowUp extends Model(props) {
  update(details: FollowUpInterface) {
    Object.assign(this, details);
  }

  get $view() {
    return {
      ...this.$,
    };
  }
}

@model("myApp/FollowUpStore")
export class FollowUpStore extends Model({
  items: prop<FollowUp[]>(() => []),
}) {
  @computed
  get itemsSignature() {
    const keys = Object.keys(new FollowUp({}).$) as (keyof FollowUpInterface)[];
    return this.items
      .map((item) => keys.map((key) => String(item[key])).join("|"))
      .join("::");
  }

  @computed
  get allItems() {
    const map = new Map<number, FollowUp>();
    this.items.forEach((item) => map.set(item.id, item));
    return map;
  }

  @modelFlow
  fetchAll = _async(function* (this: FollowUpStore, params?: string) {
    let result;

    try {
      result = yield* _await(fetchItemsRequest<FollowUp>(slug, params));
    } catch (error) {
      alert(error);
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      return result;
    }

    result.data.forEach((s) => {
      if (!this.items.map((s) => s.id).includes(s.id)) {
        this.items.push(new FollowUp(s));
      } else {
        this.items.find((t) => t.id === s.id)?.update(s);
      }
    });

    return result;
  });

  @modelFlow
  addItem = _async(function* (this: FollowUpStore, details: FollowUpInterface) {
    let result;

    try {
      result = yield* _await(postItemRequest<FollowUpInterface>(slug, details));
    } catch (error) {
      alert(error);
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      return result;
    }

    const item = new FollowUp(result.data);
    this.items.push(item);

    return { details: "", ok: true, data: item };
  });

  @modelFlow
  updateItem = _async(function* (
    this: FollowUpStore,
    itemId: number,
    details: FollowUpInterface
  ) {
    let result;

    try {
      result = yield* _await(
        updateItemRequest<FollowUpInterface>(slug, itemId, details)
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
  deleteItem = _async(function* (this: FollowUpStore, itemId: number) {
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
