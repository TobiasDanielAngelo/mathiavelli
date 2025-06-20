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
import Swal from "sweetalert2";
import { Store } from "./Store";

const slug = "finance/payables";

const props = {
  id: prop<number>(-1),
  payment: prop<number[] | null>(null),
  lenderName: prop<string>(""),
  datetimeOpened: prop<string>(""),
  datetimeDue: prop<string>(""),
  description: prop<string>(""),
  datetimeClosed: prop<string>(""),
  borrowedAmount: prop<number>(0),
  isActive: prop<boolean>(false),
  paymentTotal: prop<number>(0),
};

export type PayableInterface = {
  [K in keyof typeof props]?: (typeof props)[K] extends ReturnType<
    typeof prop<infer T>
  >
    ? T
    : never;
};

export const PayableFields: Record<string, (keyof PayableInterface)[]> = {
  datetime: ["datetimeOpened", "datetimeDue", "datetimeClosed"] as const,
  date: [] as const,
  time: [] as const,
  prices: ["borrowedAmount", "paymentTotal"] as const,
};

@model("myApp/Payable")
export class Payable extends Model(props) {
  update(details: PayableInterface) {
    Object.assign(this, details);
  }

  get paymentDescription() {
    return this.payment?.map(
      (s) =>
        getRoot<Store>(this)?.transactionStore?.allItems.get(s)?.description ??
        ""
    );
  }

  get $view() {
    return {
      ...this.$,
      paymentDescription: this.payment?.map(
        (s) =>
          getRoot<Store>(this)?.transactionStore?.allItems.get(s)
            ?.description ?? ""
      ),
    };
  }
}

@model("myApp/PayableStore")
export class PayableStore extends Model({
  items: prop<Payable[]>(() => []),
}) {
  @computed
  get itemsSignature() {
    const keys = Object.keys(new Payable({}).$) as (keyof PayableInterface)[];
    return this.items
      .map((item) => keys.map((key) => String(item[key])).join("|"))
      .join("::");
  }

  @computed
  get allItems() {
    const map = new Map<number, Payable>();
    this.items.forEach((item) => map.set(item.id, item));
    return map;
  }

  @modelFlow
  fetchAll = _async(function* (this: PayableStore, params?: string) {
    let result;

    try {
      result = yield* _await(fetchItemsRequest<Payable>(slug, params));
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
        this.items.push(new Payable(s));
      } else {
        this.items.find((t) => t.id === s.id)?.update(s);
      }
    });

    return result;
  });

  @modelFlow
  addItem = _async(function* (this: PayableStore, details: PayableInterface) {
    let result;

    try {
      result = yield* _await(postItemRequest<PayableInterface>(slug, details));
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

    const item = new Payable(result.data);
    this.items.push(item);

    return { details: "", ok: true, data: item };
  });

  @modelFlow
  updateItem = _async(function* (
    this: PayableStore,
    itemId: number,
    details: PayableInterface
  ) {
    let result;

    try {
      result = yield* _await(
        updateItemRequest<PayableInterface>(slug, itemId, details)
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
  deleteItem = _async(function* (this: PayableStore, itemId: number) {
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
