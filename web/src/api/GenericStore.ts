import { computed } from "mobx";
import {
  _async,
  _await,
  getRoot,
  model,
  Model,
  ModelClass,
  modelFlow,
  ModelProps,
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
  id: number | null;
  $view: Required<U>;
  update: (details: Partial<U>) => void;
};

type StoreItemType<K extends keyof Store> = Store[K] extends {
  items: (infer U)[];
}
  ? U
  : never;

type NullableProps<T> = {
  [K in keyof T]: T[K] | null;
};

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

export function GenerateModel<TProps extends ModelProps, TView>(
  props: TProps,
  derivedProps: (self: any) => TView = () => ({} as TView),
  keyName: string
) {
  type GenericInterface = PropsToInterface<typeof props>;

  const Base = Model(props) as new (...args: any[]) => object;

  // @ts-expect-error mobx-keystone decorator returns new class
  @model(`myApp/${keyName}`)
  class GenericModel extends Base {
    update(details: GenericInterface) {
      Object.assign(this, details);
    }

    get $() {
      return this;
    }

    get $view(): TView {
      return {
        ...this.$,
        ...derivedProps(this),
      };
    }
  }

  return GenericModel as ModelClass<
    InstanceType<ReturnType<typeof Model<TProps>>> &
      KeystoneModel<PropsToInterface<TProps> & TView> &
      TView
  >;
}

export function GenerateStore<T extends KeystoneModel<{ id?: number | null }>>(
  ModelClass: {
    new (...args: any[]): T;
  },
  slug: string,
  keyName: string
) {
  @model(`myApp/${keyName}Store`)
  class GenericStore extends Model({
    items: prop<T[]>(() => []),
  }) {
    @computed
    get allItems() {
      const map = new Map<number, T>();
      this.items.forEach((item) => map.set(item.id ?? -1, item));
      return map;
    }

    @computed
    get itemsSignature() {
      function computeItemsSignature<T extends { $view: Record<string, any> }>(
        ModelClass: { new (...args: any[]): T },
        items: T[]
      ): string {
        const keys = Object.keys(new ModelClass({}).$view);
        return items
          .map((item) => keys.map((key) => String(item.$view[key])).join("|"))
          .join("::");
      }
      return computeItemsSignature(ModelClass, this.items);
    }

    @modelFlow
    fetchAll = _async(function* (this: GenericStore, params?: string) {
      let result;

      try {
        result = yield* _await(fetchItemsRequest<Partial<T>>(slug, params));
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

      result.data.forEach((s: Partial<T>) => {
        if (!s.id) return;
        if (!this.items.map((i) => i.$view.id).includes(s.id)) {
          this.items.push(new ModelClass(s));
        } else {
          this.items.find((t) => t.$view.id === s.id)?.update(s);
        }
      });

      return result;
    });

    @modelFlow
    addItem = _async(function* (
      this: GenericStore,
      details: NullableProps<Partial<T>>
    ) {
      let result;
      try {
        result = yield* _await(
          postItemRequest<NullableProps<Partial<T>>>(slug, details)
        );
      } catch {
        Swal.fire({ icon: "error", title: "Network Error" });
        return { details: "Network Error", ok: false, data: null };
      }

      if (!result.ok || !result.data) {
        Swal.fire({ icon: "error", title: "An error has occurred." });
        return { details: "An error has occurred", ok: false, data: null };
      }

      const item = new ModelClass(result.data);
      this.items.push(item);

      return { details: "", ok: true, data: item };
    });

    @modelFlow
    updateItem = _async(function* (
      this: GenericStore,
      itemId: number,
      details: NullableProps<Partial<T>>
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
