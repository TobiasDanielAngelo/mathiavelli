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

const slug = "issues/comments";

const props = {
  id: prop<number>(-1),
  ticket: prop<number | null>(null),
  user: prop<number | null>(null),
  content: prop<string>(""),
  createdAt: prop<string>(""),
};

export type IssueCommentInterface = {
  [K in keyof typeof props]?: (typeof props)[K] extends ReturnType<
    typeof prop<infer T>
  >
    ? T
    : never;
};

export const IssueCommentFields: Record<
  string,
  (keyof IssueCommentInterface)[]
> = {
  datetimeFields: ["createdAt"] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};

@model("myApp/IssueComment")
export class IssueComment extends Model(props) {
  update(details: IssueCommentInterface) {
    Object.assign(this, details);
  }

  get ticketTitle() {
    return (
      getRoot<Store>(this)?.ticketStore?.allItems.get(this.ticket ?? -1)
        ?.title || "—"
    );
  }
  get userName() {
    return (
      getRoot<Store>(this)?.userStore?.allItems.get(this.user ?? -1)
        ?.fullName || "—"
    );
  }

  get $view() {
    return {
      ...this.$,
      ticketTitle:
        getRoot<Store>(this)?.ticketStore?.allItems.get(this.ticket ?? -1)
          ?.title || "—",
      userName:
        getRoot<Store>(this)?.userStore?.allItems.get(this.user ?? -1)
          ?.fullName || "—",
    };
  }
}

@model("myApp/IssueCommentStore")
export class IssueCommentStore extends Model({
  items: prop<IssueComment[]>(() => []),
}) {
  @computed
  get itemsSignature() {
    const keys = Object.keys(
      new IssueComment({}).$
    ) as (keyof IssueCommentInterface)[];
    return this.items
      .map((item) => keys.map((key) => String(item[key])).join("|"))
      .join("::");
  }

  @computed
  get allItems() {
    const map = new Map<number, IssueComment>();
    this.items.forEach((item) => map.set(item.id, item));
    return map;
  }

  @modelFlow
  fetchAll = _async(function* (this: IssueCommentStore, params?: string) {
    let result;

    try {
      result = yield* _await(fetchItemsRequest<IssueComment>(slug, params));
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
        this.items.push(new IssueComment(s));
      } else {
        this.items.find((t) => t.id === s.id)?.update(s);
      }
    });

    return result;
  });

  @modelFlow
  addItem = _async(function* (
    this: IssueCommentStore,
    details: IssueCommentInterface
  ) {
    let result;

    try {
      result = yield* _await(
        postItemRequest<IssueCommentInterface>(slug, details)
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

    const item = new IssueComment(result.data);
    this.items.push(item);

    return { details: "", ok: true, data: item };
  });

  @modelFlow
  updateItem = _async(function* (
    this: IssueCommentStore,
    itemId: number,
    details: IssueCommentInterface
  ) {
    let result;

    try {
      result = yield* _await(
        updateItemRequest<IssueCommentInterface>(slug, itemId, details)
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
  deleteItem = _async(function* (this: IssueCommentStore, itemId: number) {
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
