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
import { GraphType } from "../blueprints/MyGenericComponents/MyGenericView";

const slug = "health/analytics/weigh-ins";

const props = {
  id: prop<string>(""),
  graph: prop<GraphType>("pie"),
  aveWeight: prop<number | null>(null),
  period: prop<string | null>(null),
};

export type WeighInAnalyticsInterface = {
  [K in keyof typeof props]?: (typeof props)[K] extends ReturnType<
    typeof prop<infer T>
  >
    ? T
    : never;
};

@model("myApp/WeighInAnalytics")
export class WeighInAnalytics extends Model(props) {
  update(details: WeighInAnalyticsInterface) {
    Object.assign(this, details);
  }
}

@model("myApp/WeighInAnalyticsStore")
export class WeighInAnalyticsStore extends Model({
  items: prop<WeighInAnalytics[]>(() => []),
}) {
  @computed
  get itemsSignature() {
    const keys = Object.keys(
      new WeighInAnalytics({}).$
    ) as (keyof WeighInAnalyticsInterface)[];
    return this.items
      .map((item) => keys.map((key) => String(item[key])).join("|"))
      .join("::");
  }

  @computed
  get allItems() {
    const map = new Map<number, WeighInAnalytics>();
    this.items.forEach((item, ind) => map.set(ind, item));
    return map;
  }

  @modelFlow
  fetchAll = _async(function* (this: WeighInAnalyticsStore, params?: string) {
    let result;

    try {
      result = yield* _await(fetchItemsRequest<WeighInAnalytics>(slug, params));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
      });
      error;
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      Swal.fire({
        icon: "error",
        title: "An error has occurred.",
      });

      if (!result.ok || !result.data) {
        return { details: "An error has occurred", ok: false, data: null };
      }
    }

    this.resetItems();

    result.data.forEach((s) => {
      if (!this.items.map((s) => s.id).includes(s.id)) {
        this.items.push(new WeighInAnalytics(s));
      } else {
        this.items.find((t) => t.id === s.id)?.update(s);
      }
    });

    return result;
  });

  @modelAction
  resetItems = function (this: WeighInAnalyticsStore) {
    this.items = [];
  };
}
