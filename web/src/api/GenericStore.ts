import { computed } from "mobx";
import { Model, _async, _await, modelFlow, prop } from "mobx-keystone";
import Swal from "sweetalert2";
import {
  deleteItemRequest,
  fetchItemsRequest,
  postItemRequest,
  updateItemRequest,
} from "./_apiHelpers";

type KeystoneModel = {
  $view: Record<string, any>;
  update: (data: any) => void;
};

export function createGenericStore<
  U extends { id?: number | null },
  T extends KeystoneModel
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
