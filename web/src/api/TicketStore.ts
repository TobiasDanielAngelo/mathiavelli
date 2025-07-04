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

const slug = "issues/tickets";

const props = {
  id: prop<number>(-1),
  title: prop<string>(""),
  tags: prop<number[] | null>(null),
  description: prop<string>(""),
  status: prop<number>(0),
  priority: prop<number>(0),
  createdAt: prop<string>(""),
  updatedAt: prop<string>(""),
  assignedTo: prop<number | null>(null),
};

export const STATUS_CHOICES = ["Open", "In Progress", "Closed"];
export const PRIORITY_CHOICES = ["Low", "Medium", "High"];

export type TicketInterface = {
  [K in keyof typeof props]?: (typeof props)[K] extends ReturnType<
    typeof prop<infer T>
  >
    ? T
    : never;
};

export const TicketFields: Record<string, (keyof TicketInterface)[]> = {
  datetimeFields: ["createdAt", "updatedAt"] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};

@model("myApp/Ticket")
export class Ticket extends Model(props) {
  update(details: TicketInterface) {
    Object.assign(this, details);
  }

  get tagsName() {
    return this.tags?.map(
      (s) => getRoot<Store>(this)?.tagStore?.allItems.get(s)?.name ?? ""
    );
  }
  get statusName() {
    return STATUS_CHOICES.find((_, ind) => ind === this.status) ?? "—";
  }
  get priorityName() {
    return PRIORITY_CHOICES.find((_, ind) => ind === this.priority) ?? "—";
  }
  get assignedToName() {
    return (
      getRoot<Store>(this)?.userStore?.allItems.get(this.assignedTo ?? -1)
        ?.fullName || "—"
    );
  }

  get $view() {
    return {
      ...this.$,
      tagsName: this.tags?.map(
        (s) => getRoot<Store>(this)?.tagStore?.allItems.get(s)?.name ?? ""
      ),
      statusName: STATUS_CHOICES.find((_, ind) => ind === this.status) ?? "—",
      priorityName:
        PRIORITY_CHOICES.find((_, ind) => ind === this.priority) ?? "—",
      assignedToName:
        getRoot<Store>(this)?.userStore?.allItems.get(this.assignedTo ?? -1)
          ?.fullName || "—",
    };
  }
}

@model("myApp/TicketStore")
export class TicketStore extends Model({
  items: prop<Ticket[]>(() => []),
}) {
  @computed
  get itemsSignature() {
    const keys = Object.keys(new Ticket({}).$view) as (keyof TicketInterface)[];
    return this.items
      .map((item) => keys.map((key) => String(item[key])).join("|"))
      .join("::");
  }

  @computed
  get allItems() {
    const map = new Map<number, Ticket>();
    this.items.forEach((item) => map.set(item.id, item));
    return map;
  }

  @modelFlow
  fetchAll = _async(function* (this: TicketStore, params?: string) {
    let result;

    try {
      result = yield* _await(fetchItemsRequest<Ticket>(slug, params));
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
        this.items.push(new Ticket(s));
      } else {
        this.items.find((t) => t.id === s.id)?.update(s);
      }
    });

    return result;
  });

  @modelFlow
  addItem = _async(function* (this: TicketStore, details: TicketInterface) {
    let result;

    try {
      result = yield* _await(postItemRequest<TicketInterface>(slug, details));
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

    const item = new Ticket(result.data);
    this.items.push(item);

    return { details: "", ok: true, data: item };
  });

  @modelFlow
  updateItem = _async(function* (
    this: TicketStore,
    itemId: number,
    details: TicketInterface
  ) {
    let result;

    try {
      result = yield* _await(
        updateItemRequest<TicketInterface>(slug, itemId, details)
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
  deleteItem = _async(function* (this: TicketStore, itemId: number) {
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
