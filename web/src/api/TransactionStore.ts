import { computed } from "mobx";
import {
  Model,
  _async,
  _await,
  getRoot,
  model,
  modelFlow,
  prop,
} from "mobx-keystone";
import {
  deleteItemRequest,
  fetchItemsRequest,
  postItemRequest,
  updateItemRequest,
} from "../constants/storeHelpers";
import { Store } from "./Store";

const slug = "transactions";

const props = {
  id: prop<number>(-1),
  category: prop<number | null>(null),
  description: prop<string>(""),
  transmitter: prop<number | null>(null),
  receiver: prop<number | null>(null),
  amount: prop<number>(0),
  datetimeTransacted: prop<string>(""),

  receivableId: prop<number | null>(null),
  payableId: prop<number | null>(null),
};

export type TransactionInterface = {
  [K in keyof typeof props]?: (typeof props)[K] extends ReturnType<
    typeof prop<infer T>
  >
    ? T
    : never;
};

@model("myApp/Transaction")
export class Transaction extends Model(props) {
  update(details: TransactionInterface) {
    Object.assign(this, details);
  }
  get categoryName() {
    const store = getRoot<Store>(this);
    return store.categoryStore.allItems.get(this.category ?? -1)?.title || "—";
  }
  get transmitterName() {
    const store = getRoot<Store>(this);
    return store.accountStore.allItems.get(this.transmitter ?? -1)?.name || "—";
  }
  get receiverName() {
    const store = getRoot<Store>(this);
    return store.accountStore.allItems.get(this.receiver ?? -1)?.name || "—";
  }

  get $view() {
    const store = getRoot<Store>(this);
    return {
      ...this.$,
      categoryName:
        store?.categoryStore?.allItems.get(this.category ?? -1)?.title || "—",
      transmitterName:
        store?.accountStore?.allItems.get(this.transmitter ?? -1)?.name || "—",
      receiverName:
        store?.accountStore?.allItems.get(this.receiver ?? -1)?.name || "—",
    };
  }
}

@model("myApp/TransactionStore")
export class TransactionStore extends Model({
  items: prop<Transaction[]>(() => []),
}) {
  @computed
  get itemsSignature() {
    const keys = Object.keys(
      new Transaction({}).$
    ) as (keyof TransactionInterface)[];
    return this.items
      .map((item) => keys.map((key) => String(item[key])).join("|"))
      .join("::");
  }

  @computed
  get allItems() {
    const map = new Map<number, Transaction>();
    this.items.forEach((item) => map.set(item.id, item));
    return map;
  }

  @modelFlow
  fetchAll = _async(function* (this: TransactionStore, params?: string) {
    let result;

    try {
      result = yield* _await(fetchItemsRequest<Transaction>(slug, params));
    } catch (error) {
      alert(error);
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      return result;
    }

    result.data.forEach((s) => {
      if (!this.items.map((s) => s.id).includes(s.id)) {
        this.items.push(new Transaction(s));
      } else {
        this.items.find((t) => t.id === s.id)?.update(s);
      }
    });

    return result;
  });

  @modelFlow
  addItem = _async(function* (
    this: TransactionStore,
    details: TransactionInterface
  ) {
    let result;

    try {
      result = yield* _await(
        postItemRequest<TransactionInterface>(slug, details)
      );
    } catch (error) {
      alert(error);
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      return result;
    }

    const item = new Transaction(result.data);
    this.items.push(item);

    return { details: "", ok: true, data: item };
  });

  @modelFlow
  updateItem = _async(function* (
    this: TransactionStore,
    itemId: number,
    details: TransactionInterface
  ) {
    let result;

    try {
      result = yield* _await(
        updateItemRequest<TransactionInterface>(slug, itemId, details)
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
  deleteItem = _async(function* (this: TransactionStore, itemId: number) {
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
