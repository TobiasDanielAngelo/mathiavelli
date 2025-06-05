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
import {
  deleteItemRequest,
  fetchItemsRequest,
  postItemRequest,
  updateItemRequest,
} from "../constants/storeHelpers";
import { Store } from "./Store";

const slug = "events";

const props = {
  id: prop<number>(-1),
  title: prop<string>(""),
  description: prop<string>(""),
  start: prop<string>(""),
  end: prop<string>(""),
  allDay: prop<boolean>(false),
  location: prop<string>(""),
  tags: prop<number[]>(() => []),
  createdAt: prop<string>(""),
};

export type EventInterface = {
  [K in keyof typeof props]?: (typeof props)[K] extends ReturnType<
    typeof prop<infer T>
  >
    ? T
    : never;
};

@model("myApp/Event")
export class Event extends Model(props) {
  update(details: EventInterface) {
    Object.assign(this, details);
  }

  get tagNames() {
    const store = getRoot<Store>(this);
    return this.tags.map((s) => store.tagStore.allItems.get(s)?.name ?? "");
  }

  get $view() {
    const store = getRoot<Store>(this);
    return {
      ...this.$,
      tagNames: this.tags.map(
        (s) => store?.tagStore?.allItems.get(s)?.name ?? ""
      ),
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
      alert(error);
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      return result;
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
      alert(error);
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      return result;
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
      alert(error);
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      return result;
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
      alert(error);
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
