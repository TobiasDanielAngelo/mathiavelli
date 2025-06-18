import { computed } from "mobx";
import { Model, _async, _await, model, modelFlow, prop } from "mobx-keystone";
import {
  deleteItemRequest,
  fetchItemsRequest,
  postItemRequest,
  updateItemRequest,
} from "../constants/storeHelpers";
import Swal from "sweetalert2";

const slug = "accounts";

const props = {
  id: prop<number>(-1),
  name: prop<string>(""),
  datetimeAdded: prop<string>(""),
};

export type AccountInterface = {
  [K in keyof typeof props]?: (typeof props)[K] extends ReturnType<
    typeof prop<infer T>
  >
    ? T
    : never;
};

export const AccountFields: Record<string, (keyof AccountInterface)[]> = {
  datetime: ["datetimeAdded"] as const,
  date: [] as const,
  time: [] as const,
  prices: [] as const,
};

@model("myApp/Account")
export class Account extends Model(props) {
  update(details: AccountInterface) {
    Object.assign(this, details);
  }

  get $view() {
    return {
      ...this.$,
    };
  }
}

@model("myApp/AccountStore")
export class AccountStore extends Model({
  items: prop<Account[]>(() => []),
}) {
  @computed
  get itemsSignature() {
    const keys = Object.keys(new Account({}).$) as (keyof AccountInterface)[];
    return this.items
      .map((item) => keys.map((key) => String(item[key])).join("|"))
      .join("::");
  }

  @computed
  get allItems() {
    const map = new Map<number, Account>();
    this.items.forEach((item) => map.set(item.id, item));
    return map;
  }

  @modelFlow
  fetchAll = _async(function* (this: AccountStore, params?: string) {
    let result;

    try {
      result = yield* _await(fetchItemsRequest<Account>(slug, params));
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
        this.items.push(new Account(s));
      } else {
        this.items.find((t) => t.id === s.id)?.update(s);
      }
    });

    return result;
  });

  @modelFlow
  addItem = _async(function* (this: AccountStore, details: AccountInterface) {
    let result;

    try {
      result = yield* _await(postItemRequest<AccountInterface>(slug, details));
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

    const item = new Account(result.data);
    this.items.push(item);

    return { details: "", ok: true, data: item };
  });

  @modelFlow
  updateItem = _async(function* (
    this: AccountStore,
    itemId: number,
    details: AccountInterface
  ) {
    let result;

    try {
      result = yield* _await(
        updateItemRequest<AccountInterface>(slug, itemId, details)
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
  deleteItem = _async(function* (this: AccountStore, itemId: number) {
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
