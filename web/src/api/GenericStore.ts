import { computed } from "mobx";
import {
  _async,
  _await,
  AnyModelProp,
  getRoot,
  Model,
  modelFlow,
  prop,
} from "mobx-keystone";
import Swal from "sweetalert2";
import { PropsToInterface } from "../constants/interfaces";
import {
  deleteItemRequest,
  fetchItemsRequest,
  postItemRequest,
  updateItemRequest,
} from "./_apiHelpers";
import { Store } from "./Store";

type KeystoneModel<U> = {
  $view: Record<string, any>;
  update: (data: U) => void;
};

type StoreItemType<K extends keyof Store> = Store[K] extends {
  items: (infer U)[];
}
  ? U
  : never;

function hasAllItems(obj: any): obj is { allItems: Map<number, any> } {
  return obj && typeof obj === "object" && "allItems" in obj;
}

export function getStoreItem<K extends keyof Store>(
  self: any,
  storeKey: K,
  id: number
): StoreItemType<K> | undefined {
  const targetedStore = getRoot<Store>(self)?.[storeKey];
  if (typeof targetedStore === "string" || typeof targetedStore === "function")
    return;
  if (hasAllItems(targetedStore)) {
    const item = targetedStore.allItems.get(id);
    return item as StoreItemType<K>;
  }
}

export function createGenericModel(
  props: Record<string, AnyModelProp>,
  extendView?: (self: any) => any
) {
  type GenericInterface = PropsToInterface<typeof props>;

  class GenericModel extends Model(props) implements GenericInterface {
    id!: number;
    update(details: GenericInterface) {
      Object.assign(this, details);
    }

    get $view() {
      return {
        ...this.$,
        ...(extendView && extendView(this)),
      };
    }
  }
  return GenericModel;
}

export function createGenericStore<
  U extends { id?: number | null },
  T extends KeystoneModel<U> & { id: number }
>(
  modelClass: {
    new (...args: any[]): T;
  },
  slug: string
) {
  class GenericStore extends Model({
    items: prop<T[]>(() => []),
  }) {
    @computed
    get allItems() {
      const map = new Map<number, T>();
      this.items.forEach((item) => map.set(item.id, item));
      return map;
    }

    @computed
    get itemsSignature() {
      function computeItemsSignature<T extends { $view: Record<string, any> }>(
        modelClass: { new (...args: any[]): T },
        items: T[]
      ): string {
        const keys = Object.keys(new modelClass({}).$view);
        return items
          .map((item) => keys.map((key) => String(item.$view[key])).join("|"))
          .join("::");
      }
      return computeItemsSignature(modelClass, this.items);
    }

    @modelFlow
    fetchAll = _async(function* (this: GenericStore, params?: string) {
      let result;

      try {
        result = yield* _await(fetchItemsRequest<U>(slug, params));
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
        return { details: "An error has occurred", ok: false, data: null };
      }

      result.data.forEach((s: U) => {
        if (!this.items.map((i) => i.$view.id).includes(s.id)) {
          this.items.push(new modelClass(s));
        } else {
          this.items.find((t) => t.$view.id === s.id)?.update(s);
        }
      });

      return result;
    });

    @modelFlow
    addItem = _async(function* (this: GenericStore, details: U) {
      let result;
      try {
        result = yield* _await(postItemRequest<U>(slug, details));
      } catch {
        Swal.fire({ icon: "error", title: "Network Error" });
        return { details: "Network Error", ok: false, data: null };
      }

      if (!result.ok || !result.data) {
        Swal.fire({ icon: "error", title: "An error has occurred." });
        return { details: "An error has occurred", ok: false, data: null };
      }

      const item = new modelClass(result.data);
      this.items.push(item);

      return { details: "", ok: true, data: item };
    });

    @modelFlow
    updateItem = _async(function* (
      this: GenericStore,
      itemId: number,
      details: U
    ) {
      let result;
      try {
        result = yield* _await(updateItemRequest(slug, itemId, details));
      } catch {
        Swal.fire({ icon: "error", title: "Network Error" });
        return { details: "Network Error", ok: false, data: null };
      }

      if (!result.ok || !result.data) {
        Swal.fire({ icon: "error", title: "An error has occurred." });
        return { details: "An error has occurred", ok: false, data: null };
      }

      this.items
        .find((t) => t.$view.id === (result.data?.id ?? -1))
        ?.update(result.data);
      return { details: "", ok: true, data: result.data };
    });

    @modelFlow
    deleteItem = _async(function* (this: GenericStore, itemId: number) {
      let result;
      try {
        result = yield* _await(deleteItemRequest(slug, itemId));
      } catch {
        Swal.fire({ icon: "error", title: "Network Error" });
        return { details: "Network Error", ok: false, data: null };
      }

      if (!result.ok) {
        return result;
      }

      const index = this.items.findIndex((s) => s.$view.id === itemId);
      if (index !== -1) {
        this.items.splice(index, 1);
      }

      return result;
    });
  }

  return GenericStore;
}
