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

const slug = "productivity/tasks";

const props = {
  id: prop<number>(-1),
  title: prop<string>(""),
  description: prop<string>(""),
  goal: prop<number | null>(null),
  habit: prop<number | null>(null),
  schedule: prop<number | null>(null),
  importance: prop<number>(0),
  dueDate: prop<string>(""),
  dateCompleted: prop<string>(""),
  dateStart: prop<string>(""),
  dateEnd: prop<string>(""),
  dateCreated: prop<string>(""),
  isArchived: prop<boolean>(false),
};

export const FREQUENCY_CHOICES = [
  "None",
  "Daily",
  "Weekly",
  "Monthly",
  "Yearly",
];

export type TaskInterface = {
  [K in keyof typeof props]?: (typeof props)[K] extends ReturnType<
    typeof prop<infer T>
  >
    ? T
    : never;
};

export const TaskFields: Record<string, (keyof TaskInterface)[]> = {
  datetimeFields: [
    "dateCreated",
    "dateCompleted",
    "dateStart",
    "dateEnd",
  ] as const,
  dateFields: ["dueDate"] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};

@model("myApp/Task")
export class Task extends Model(props) {
  update(details: TaskInterface) {
    Object.assign(this, details);
  }

  get goalTitle() {
    return (
      getRoot<Store>(this)?.goalStore?.allItems.get(this.goal ?? -1)?.title ||
      "—"
    );
  }

  get habitTitle() {
    return (
      getRoot<Store>(this)?.habitStore?.allItems.get(this.habit ?? -1)?.title ||
      "—"
    );
  }

  get dateDuration() {
    return `${this.dateStart ? moment(this.dateStart).format("lll") : ""}${
      this.dateEnd ? " – " + moment(this.dateEnd).format("lll") : ""
    }`;
  }
  get scheduleDefinition() {
    return (
      getRoot<Store>(this)?.scheduleStore?.allItems.get(this.schedule ?? -1)
        ?.definition || "—"
    );
  }

  get $view() {
    return {
      ...this.$,
      goalTitle:
        getRoot<Store>(this)?.goalStore?.allItems.get(this.goal ?? -1)?.title ||
        "—",
      habitTitle:
        getRoot<Store>(this)?.habitStore?.allItems.get(this.habit ?? -1)
          ?.title || "—",
      scheduleDefinition:
        getRoot<Store>(this)?.scheduleStore?.allItems.get(this.schedule ?? -1)
          ?.name || "—",
      dateDuration: this.dateDuration,
    };
  }
}

@model("myApp/TaskStore")
export class TaskStore extends Model({
  items: prop<Task[]>(() => []),
}) {
  @computed
  get itemsSignature() {
    const keys = Object.keys(new Task({}).$) as (keyof TaskInterface)[];
    return this.items
      .map((item) => keys.map((key) => String(item[key])).join("|"))
      .join("::");
  }

  @computed
  get allItems() {
    const map = new Map<number, Task>();
    this.items.forEach((item) => map.set(item.id, item));
    return map;
  }

  @modelFlow
  fetchAll = _async(function* (this: TaskStore, params?: string) {
    let result;

    try {
      result = yield* _await(fetchItemsRequest<Task>(slug, params));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
      });
      error;
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      return result;
    }

    result.data.forEach((s) => {
      if (!this.items.map((s) => s.id).includes(s.id)) {
        this.items.push(new Task(s));
      } else {
        this.items.find((t) => t.id === s.id)?.update(s);
      }
    });

    return result;
  });

  @modelFlow
  addItem = _async(function* (this: TaskStore, details: TaskInterface) {
    let result;

    try {
      result = yield* _await(postItemRequest<TaskInterface>(slug, details));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
      });
      error;
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      return result;
    }

    const item = new Task(result.data);
    this.items.push(item);

    return { details: "", ok: true, data: item };
  });

  @modelFlow
  updateItem = _async(function* (
    this: TaskStore,
    itemId: number,
    details: TaskInterface
  ) {
    let result;

    try {
      result = yield* _await(
        updateItemRequest<TaskInterface>(slug, itemId, details)
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
      return result;
    }

    this.allItems.get(result.data.id ?? -1)?.update(result.data);

    return { details: "", ok: true, data: result.data };
  });

  @modelFlow
  deleteItem = _async(function* (this: TaskStore, itemId: number) {
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
