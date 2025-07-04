import { computed } from "mobx";
import {
  Model,
  _async,
  _await,
  getRoot,
  model,
  modelFlow,
  prop,
} from "mobx-keystone";
import moment from "moment";
import Swal from "sweetalert2";
import {
  deleteItemRequest,
  fetchItemsRequest,
  postItemRequest,
  updateItemRequest,
} from "./_apiHelpers";
import { Store } from "./Store";

const slug = "productivity/events";

const props = {
  id: prop<number>(-1),
  title: prop<string>(""),
  description: prop<string>(""),
  dateStart: prop<string>(""),
  dateEnd: prop<string>(""),
  dateCompleted: prop<string>(""),
  isArchived: prop<boolean>(false),
  location: prop<string>(""),
  tags: prop<number[] | null>(null),
  dateCreated: prop<string>(""),
  task: prop<number | null>(null),
};

export type EventInterface = {
  [K in keyof typeof props]?: (typeof props)[K] extends ReturnType<
    typeof prop<infer T>
  >
    ? T
    : never;
};

export const EventFields: Record<string, (keyof EventInterface)[]> = {
  datetimeFields: [
    "dateStart",
    "dateEnd",
    "dateCreated",
    "dateCompleted",
  ] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};

@model("myApp/Event")
export class Event extends Model(props) {
  update(details: EventInterface) {
    Object.assign(this, details);
  }

  get tagsName() {
    return this.tags?.map(
      (s) => getRoot<Store>(this)?.tagStore?.allItems.get(s)?.name ?? ""
    );
  }

  get taskTitle() {
    return (
      getRoot<Store>(this)?.taskStore?.allItems.get(this?.task ?? -1)?.title ??
      ""
    );
  }

  get dateDuration() {
    return `${moment(this.dateStart).format("lll")}${
      this.dateEnd ? " – " + moment(this.dateEnd).format("lll") : ""
    }`;
  }

  get $view() {
    return {
      ...this.$,
      tagsName: this.tags?.map(
        (s) => getRoot<Store>(this)?.tagStore?.allItems.get(s)?.name ?? ""
      ),
      taskTitle:
        getRoot<Store>(this)?.taskStore?.allItems.get(this?.task ?? -1)
          ?.title ?? "",
      dateDuration: this.dateDuration,
    };
  }
}

@model("myApp/EventStore")
export class EventStore extends Model({
  items: prop<Event[]>(() => []),
}) {
  @computed
  get itemsSignature() {
    const keys = Object.keys(new Event({}).$) as (keyof EventInterface)[];
    return this.items
      .map((item) => keys.map((key) => String(item[key])).join("|"))
      .join("::");
  }

  @computed
  get allItems() {
    const map = new Map<number, Event>();
    this.items.forEach((item) => map.set(item.id, item));
    return map;
  }

  @modelFlow
  fetchAll = _async(function* (this: EventStore, params?: string) {
    let result;

    try {
      result = yield* _await(fetchItemsRequest<Event>(slug, params));
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
        this.items.push(new Event(s));
      } else {
        this.items.find((t) => t.id === s.id)?.update(s);
      }
    });

    return result;
  });

  // Special
  @modelFlow
  fetchMissingEvents = _async(function* (this: EventStore, params?: string) {
    let result;

    try {
      result = yield* _await(
        fetchItemsRequest<Event>("productivity/generate-events", params)
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

    result.data.forEach((s) => {
      if (!this.items.map((s) => s.id).includes(s.id)) {
        this.items.push(new Event(s));
      } else {
        this.items.find((t) => t.id === s.id)?.update(s);
      }
    });

    return result;
  });

  @modelFlow
  addItem = _async(function* (this: EventStore, details: EventInterface) {
    let result;

    try {
      result = yield* _await(postItemRequest<EventInterface>(slug, details));
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

    const item = new Event(result.data);
    this.items.push(item);

    return { details: "", ok: true, data: item };
  });

  @modelFlow
  updateItem = _async(function* (
    this: EventStore,
    itemId: number,
    details: EventInterface
  ) {
    let result;

    try {
      result = yield* _await(
        updateItemRequest<EventInterface>(slug, itemId, details)
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
  deleteItem = _async(function* (this: EventStore, itemId: number) {
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
