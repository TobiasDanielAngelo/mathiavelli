import { computed } from "mobx";
import { Model, _async, _await, model, modelFlow, prop } from "mobx-keystone";
import {
  deleteItemRequest,
  fetchItemsRequest,
  postItemRequest,
  updateItemRequest,
} from "./_apiHelpers";
import Swal from "sweetalert2";

const slug = "health/weigh-ins";

const props = {
  id: prop<number>(-1),
  weightKg: prop<number>(0),
  date: prop<string>(""),
};

export type WeighInInterface = {
  [K in keyof typeof props]?: (typeof props)[K] extends ReturnType<
    typeof prop<infer T>
  >
    ? T
    : never;
};

export const WeighInFields: Record<string, (keyof WeighInInterface)[]> = {
  datetimeFields: ["date"] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};

@model("myApp/WeighIn")
export class WeighIn extends Model(props) {
  update(details: WeighInInterface) {
    Object.assign(this, details);
  }

  get $view() {
    return {
      ...this.$,
    };
  }
}

@model("myApp/WeighInStore")
export class WeighInStore extends Model({
  items: prop<WeighIn[]>(() => []),
}) {
  @computed
  get itemsSignature() {
    const keys = Object.keys(
      new WeighIn({}).$view
    ) as (keyof WeighInInterface)[];
    return this.items
      .map((item) => keys.map((key) => String(item[key])).join("|"))
      .join("::");
  }

  @computed
  get allItems() {
    const map = new Map<number, WeighIn>();
    this.items.forEach((item) => map.set(item.id, item));
    return map;
  }

  @modelFlow
  fetchAll = _async(function* (this: WeighInStore, params?: string) {
    let result;

    try {
      result = yield* _await(fetchItemsRequest<WeighIn>(slug, params));
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

    result.data.forEach((s) => {
      if (!this.items.map((s) => s.id).includes(s.id)) {
        this.items.push(new WeighIn(s));
      } else {
        this.items.find((t) => t.id === s.id)?.update(s);
      }
    });

    return result;
  });

  @modelFlow
  addItem = _async(function* (this: WeighInStore, details: WeighInInterface) {
    let result;

    try {
      result = yield* _await(postItemRequest<WeighInInterface>(slug, details));
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

    const item = new WeighIn(result.data);
    this.items.push(item);

    return { details: "", ok: true, data: item };
  });

  @modelFlow
  updateItem = _async(function* (
    this: WeighInStore,
    itemId: number,
    details: WeighInInterface
  ) {
    let result;

    try {
      result = yield* _await(
        updateItemRequest<WeighInInterface>(slug, itemId, details)
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
      Swal.fire({
        icon: "error",
        title: "An error has occurred.",
      });

      if (!result.ok || !result.data) {
        return { details: "An error has occurred", ok: false, data: null };
      }
    }

    this.allItems.get(result.data.id ?? -1)?.update(result.data);

    return { details: "", ok: true, data: result.data };
  });

  @modelFlow
  deleteItem = _async(function* (this: WeighInStore, itemId: number) {
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
