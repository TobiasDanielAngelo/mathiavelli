import { computed } from "mobx";
import {
  _async,
  _await,
  model,
  Model,
  modelAction,
  ModelClass,
  modelFlow,
  ModelProps,
  prop,
} from "mobx-keystone";
import Swal from "sweetalert2";
import {
  deleteItemRequest,
  fetchItemsRequest,
  postItemRequest,
  Related,
  updateItemRequest,
} from ".";
import { PropsToInterface } from "../constants/interfaces";
import { LoginInterface } from "./UserStore";

type KeystoneModel<U> = {
  id: number | string | null;
  $view: Required<U>;
  update: (details: Partial<U>) => void;
};

export type NullableProps<T> = {
  [K in keyof T]: T[K] | null;
};

export function MyModel<TProps extends ModelProps, TView>(
  keyName: string,
  props: TProps,
  derivedProps: (self: any) => TView = () => ({} as TView)
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

export function MyStore<
  T extends KeystoneModel<{ id?: number | string | null }>
>(
  keyName: string,
  ModelClass: {
    new (...args: any[]): T;
  },
  slug: string,
  resetOnFetch?: boolean
) {
  @model(`myApp/${keyName}Store`)
  class GenericStore extends Model({
    items: prop<T[]>(() => []),
    related: prop<Related[]>(() => []),
    relatedFields: prop<string[]>(() => []),
    optionFields: prop<string[]>(() => []),
    dateFields: prop<string[]>(() => []),
    datetimeFields: prop<string[]>(() => []),
    priceFields: prop<string[]>(() => []),
    timeFields: prop<string[]>(() => []),
    isSubscribed: prop<boolean>(false),
    lastUpdated: prop<string>(""),
    latestParam: prop<string>(""),
    countToUpdate: prop<number>(0),
  }) {
    @computed
    get allItems() {
      const map = new Map<number | string, T>();
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

    @modelAction
    setSubscription = function (this: GenericStore, state: boolean) {
      this.isSubscribed = state;
    };

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
        return {
          details: "Network Error",
          ok: false,
          data: null,
          pageDetails: null,
        };
      }

      if (!result.ok || !result.data) {
        Swal.fire({
          icon: "error",
          title: "An error has occurred.",
        });
        return {
          details: result.details,
          ok: false,
          data: null,
          pageDetails: null,
        };
      }

      resetOnFetch && this.resetItems();

      result.related?.forEach((s: Related) => {
        const existingRelated = this.related.find(
          (t) => t.field === s.field && t.id === s.id
        );
        if (!existingRelated) {
          this.related.push(s);
        } else {
          existingRelated.name = s.name;
        }
      });

      this.dateFields = result.dateFields;
      this.datetimeFields = result.datetimeFields;
      this.timeFields = result.timeFields;
      this.priceFields = result.priceFields;
      this.relatedFields = result.relatedFields;
      this.optionFields = result.optionFields;

      result.data.forEach((s: Partial<T>) => {
        if (!s.id) return;
        if (!this.items.map((i) => i.$view.id).includes(s.id)) {
          this.items.push(new ModelClass(s));
        } else {
          this.items.find((t) => t.$view.id === s.id)?.update(s);
        }
      });
      this.lastUpdated = new Date().toISOString();
      this.latestParam = params ?? "";

      return result;
    });

    @modelFlow
    checkUpdated = _async(function* (this: GenericStore, lastUpdated: string) {
      let result;

      try {
        result = yield* _await(
          fetchItemsRequest<Partial<T>>(
            slug,
            `check_last_updated=1&last_updated=${lastUpdated}`
          )
        );
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Network Error",
        });
        return { details: "Network Error", ok: false, data: null };
      }

      if (!result.ok) {
        Swal.fire({
          icon: "error",
          title: "An error has occurred.",
        });
        return { details: result.details, ok: false, data: null };
      }

      this.countToUpdate = result.pageDetails?.count ?? 0;
    });

    @modelFlow
    fetchUpdated = _async(function* (this: GenericStore) {
      return yield* _await(this.fetchAll(this.latestParam));
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
        // Swal.fire({ icon: "error", title: "An error has occurred." });
        return { details: result.details, ok: false, data: null };
      }

      const item = new ModelClass(result.data);
      this.items.push(item);

      return { details: "", ok: true, data: item };
    });

    @modelFlow
    updateItem = _async(function* (
      this: GenericStore,
      itemId: number | string,
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
        // Swal.fire({ icon: "error", title: "An error has occurred." });
        return { details: result.details, ok: false, data: null };
      }

      this.items
        .find((t) => t.$view.id === (result.data?.id ?? -1))
        ?.update(result.data);
      return { details: "", ok: true, data: result.data };
    });

    @modelFlow
    deleteItem = _async(function* (
      this: GenericStore,
      itemId: number | string
    ) {
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

    @modelFlow
    authBase = _async(function* (
      this: GenericStore,
      method: "login" | "reauth" | "logout",
      credentials?: LoginInterface
    ) {
      let result;
      try {
        result = yield* _await(
          postItemRequest(`cookie-${method}`, credentials)
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
      }
      return { details: "", ok: true, data: null };
    });

    @modelAction
    resetItems = function (this: GenericStore) {
      this.items = [];
    };
  }

  return GenericStore;
}

export type IStore = InstanceType<ReturnType<typeof MyStore>>;

export const functionBinder = (item: any) => {
  for (const key of Object.getOwnPropertyNames(item)) {
    if (typeof (item as any)[key] === "function") {
      (item as any)[key] = (item as any)[key].bind(item);
    }
  }

  const proto = Object.getPrototypeOf(item);
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key === "constructor") continue;
    const desc = Object.getOwnPropertyDescriptor(proto, key);
    if (desc?.value && typeof desc.value === "function") {
      (item as any)[key] = desc.value.bind(item);
    }
  }
};

export function storesToProps<
  T extends Record<string, new (...args: any[]) => any>
>(classes: T) {
  const result: Record<string, ReturnType<typeof prop>> = {};

  for (const key in classes) {
    const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
    result[camelKey] = prop<InstanceType<T[typeof key]>>();
  }

  return result;
}

export function instantiateStores<
  T extends Record<string, new (...args: any[]) => any>
>(classes: T) {
  const result: Record<string, InstanceType<T[keyof T]>> = {};

  for (const key in classes) {
    const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
    result[camelKey] = new classes[key]({});
  }

  return result;
}
