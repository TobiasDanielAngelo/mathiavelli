import { computed } from "mobx";
import {
  Model,
  _async,
  _await,
  model,
  modelAction,
  modelFlow,
  prop,
} from "mobx-keystone";
import { fetchItemsRequest } from "../api/_apiHelpers";
import Swal from "sweetalert2";

const slug = "analytics/transactions";

const props = {
  id: prop<string>(""),
  category: prop<number | null>(null),
  account: prop<number | null>(null),
  period: prop<string | null>(null),
  incoming: prop<number>(0),
  outgoing: prop<number>(0),
  total: prop<number>(0),
};

export type TransactionAnalyticsInterface = {
  [K in keyof typeof props]?: (typeof props)[K] extends ReturnType<
    typeof prop<infer T>
  >
    ? T
    : never;
};

@model("myApp/TransactionAnalytics")
export class TransactionAnalytics extends Model(props) {
  update(details: TransactionAnalyticsInterface) {
    Object.assign(this, details);
  }
}

@model("myApp/TransactionAnalyticsStore")
export class TransactionAnalyticsStore extends Model({
  items: prop<TransactionAnalytics[]>(() => []),
}) {
  @computed
  get itemsSignature() {
    const keys = Object.keys(
      new TransactionAnalytics({}).$
    ) as (keyof TransactionAnalyticsInterface)[];
    return this.items
      .map((item) => keys.map((key) => String(item[key])).join("|"))
      .join("::");
  }

  @computed
  get allItems() {
    const map = new Map<number, TransactionAnalytics>();
    this.items.forEach((item, ind) => map.set(ind, item));
    return map;
  }

  @modelFlow
  fetchAll = _async(function* (
    this: TransactionAnalyticsStore,
    params?: string
  ) {
    let result;

    try {
      result = yield* _await(
        fetchItemsRequest<TransactionAnalytics>(slug, params)
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

    this.resetItems();

    result.data.forEach((s) => {
      if (!this.items.map((s) => s.id).includes(s.id)) {
        this.items.push(new TransactionAnalytics(s));
      } else {
        this.items.find((t) => t.id === s.id)?.update(s);
      }
    });

    return result;
  });

  @modelAction
  resetItems = function (this: TransactionAnalyticsStore) {
    this.items = [];
  };
}
