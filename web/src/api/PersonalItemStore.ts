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
import { Store } from "./Store";
import Swal from "sweetalert2";

const slug = "finance/personal-items";

const props = {
  id: prop<number>(-1),
  name: prop<string>(""),
  category: prop<number | null>(null),
  location: prop<string>(""),
  quantity: prop<number>(0),
  acquiredDate: prop<string>(""),
  worth: prop<number>(0),
  notes: prop<string>(""),
  isImportant: prop<boolean>(false),
};

export type PersonalItemInterface = {
  [K in keyof typeof props]?: (typeof props)[K] extends ReturnType<
    typeof prop<infer T>
  >
    ? T
    : never;
};

export const PersonalItemFields: Record<
  string,
  (keyof PersonalItemInterface)[]
> = {
  datetimeFields: [] as const,
  dateFields: ["acquiredDate"] as const,
  timeFields: [] as const,
  pricesFields: ["worth"] as const,
};

@model("myApp/PersonalItem")
export class PersonalItem extends Model(props) {
  update(details: PersonalItemInterface) {
    Object.assign(this, details);
  }

  get categoryName() {
    return (
      getRoot<Store>(this)?.inventoryCategoryStore?.allItems.get(
        this.category ?? -1
      )?.name || "—"
    );
  }

  get $view() {
    return {
      ...this.$,
      categoryName:
        getRoot<Store>(this)?.inventoryCategoryStore?.allItems.get(
          this.category ?? -1
        )?.name || "—",
    };
  }
}

@model("myApp/PersonalItemStore")
export class PersonalItemStore extends Model({
  items: prop<PersonalItem[]>(() => []),
}) {
  @computed
  get itemsSignature() {
    const keys = Object.keys(
      new PersonalItem({}).$view
    ) as (keyof PersonalItemInterface)[];
    return this.items
      .map((item) => keys.map((key) => String(item[key])).join("|"))
      .join("::");
  }

  @computed
  get allItems() {
    const map = new Map<number, PersonalItem>();
    this.items.forEach((item) => map.set(item.id, item));
    return map;
  }

  @modelFlow
  fetchAll = _async(function* (this: PersonalItemStore, params?: string) {
    let result;

    try {
      result = yield* _await(fetchItemsRequest<PersonalItem>(slug, params));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
      });
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
        this.items.push(new PersonalItem(s));
      } else {
        this.items.find((t) => t.id === s.id)?.update(s);
      }
    });

    return result;
  });

  @modelFlow
  addItem = _async(function* (
    this: PersonalItemStore,
    details: PersonalItemInterface
  ) {
    let result;

    try {
      result = yield* _await(
        postItemRequest<PersonalItemInterface>(slug, details)
      );
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
      });
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

    const item = new PersonalItem(result.data);
    this.items.push(item);

    return { details: "", ok: true, data: item };
  });

  @modelFlow
  updateItem = _async(function* (
    this: PersonalItemStore,
    itemId: number,
    details: PersonalItemInterface
  ) {
    let result;

    try {
      result = yield* _await(
        updateItemRequest<PersonalItemInterface>(slug, itemId, details)
      );
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
      });
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
  deleteItem = _async(function* (this: PersonalItemStore, itemId: number) {
    let result;

    try {
      result = yield* _await(deleteItemRequest(slug, itemId));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
      });
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
