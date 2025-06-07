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

const slug = "receivables";

const props = {
  id: prop<number>(-1),
  payment: prop<number[]>(() => []),
  borrowerName: prop<string>(""),
  lentAmount: prop<number>(0),
  description: prop<string>(""),
  datetimeOpened: prop<string>(""),
  datetimeDue: prop<string>(""),
  datetimeClosed: prop<string>(""),
  isActive: prop<boolean>(true),
  paymentTotal: prop<number>(0),
};

export type ReceivableInterface = {
  [K in keyof typeof props]?: (typeof props)[K] extends ReturnType<
    typeof prop<infer T>
  >
    ? T
    : never;
};

@model("myApp/Receivable")
export class Receivable extends Model(props) {
  update(details: ReceivableInterface) {
    Object.assign(this, details);
  }

  get paymentDescription() {
    const store = getRoot<Store>(this);
    return this.payment.map(
      (s) => store.transactionStore.allItems.get(s)?.description ?? ""
    );
  }

  get $view() {
    const store = getRoot<Store>(this);
    return {
      ...this.$,
      paymentDescription: this.payment.map(
        (s) => store?.transactionStore?.allItems.get(s)?.description ?? ""
      ),
    };
  }
}

@model("myApp/ReceivableStore")
export class ReceivableStore extends Model({
  items: prop<Receivable[]>(() => []),
}) {
  @computed
  get itemsSignature() {
    const keys = Object.keys(
      new Receivable({}).$
    ) as (keyof ReceivableInterface)[];
    return this.items
      .map((item) => keys.map((key) => String(item[key])).join("|"))
      .join("::");
  }

  @computed
  get allItems() {
    const map = new Map<number, Receivable>();
    this.items.forEach((item) => map.set(item.id, item));
    return map;
  }

  @modelFlow
  fetchAll = _async(function* (this: ReceivableStore, params?: string) {
    let result;

    try {
      result = yield* _await(fetchItemsRequest<Receivable>(slug, params));
    } catch (error) {
      alert(error);
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      return result;
    }

    result.data.forEach((s) => {
      if (!this.items.map((s) => s.id).includes(s.id)) {
        this.items.push(new Receivable(s));
      } else {
        this.items.find((t) => t.id === s.id)?.update(s);
      }
    });

    return result;
  });

  @modelFlow
  addItem = _async(function* (
    this: ReceivableStore,
    details: ReceivableInterface
  ) {
    let result;

    try {
      result = yield* _await(
        postItemRequest<ReceivableInterface>(slug, details)
      );
    } catch (error) {
      alert(error);
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      return result;
    }

    const item = new Receivable(result.data);
    this.items.push(item);

    return { details: "", ok: true, data: item };
  });

  @modelFlow
  updateItem = _async(function* (
    this: ReceivableStore,
    itemId: number,
    details: ReceivableInterface
  ) {
    let result;

    try {
      result = yield* _await(
        updateItemRequest<ReceivableInterface>(slug, itemId, details)
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
  deleteItem = _async(function* (this: ReceivableStore, itemId: number) {
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
