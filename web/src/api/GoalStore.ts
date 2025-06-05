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

const slug = "goals";

const props = {
  id: prop<number>(-1),
  title: prop<string>(""),
  description: prop<string>(""),
  parentGoal: prop<number | null>(null),
  isCompleted: prop<boolean>(false),
  isCancelled: prop<boolean>(false),
  dateCompleted: prop<string>(""),
  dateStart: prop<string>(""),
  dateEnd: prop<string>(""),
  dateCreated: prop<string>(""),
};

export type GoalInterface = {
  [K in keyof typeof props]?: (typeof props)[K] extends ReturnType<
    typeof prop<infer T>
  >
    ? T
    : never;
};

@model("myApp/Goal")
export class Goal extends Model(props) {
  update(details: GoalInterface) {
    Object.assign(this, details);
  }

  get parentGoalTitle() {
    const store = getRoot<Store>(this);
    return store.goalStore.allItems.get(this.parentGoal ?? -1)?.title || "—";
  }

  get $view() {
    const store = getRoot<Store>(this);
    return {
      ...this.$,
      parentGoalTitle:
        store?.goalStore?.allItems.get(this.parentGoal ?? -1)?.title || "—",
    };
  }
}

@model("myApp/GoalStore")
export class GoalStore extends Model({
  items: prop<Goal[]>(() => []),
}) {
  @computed
  get itemsSignature() {
    const keys = Object.keys(new Goal({}).$) as (keyof GoalInterface)[];
    return this.items
      .map((item) => keys.map((key) => String(item[key])).join("|"))
      .join("::");
  }

  @computed
  get allItems() {
    const map = new Map<number, Goal>();
    this.items.forEach((item) => map.set(item.id, item));
    return map;
  }

  @modelFlow
  fetchAll = _async(function* (this: GoalStore, params?: string) {
    let result;

    try {
      result = yield* _await(fetchItemsRequest<Goal>(slug, params));
    } catch (error) {
      alert(error);
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      return result;
    }

    result.data.forEach((s) => {
      if (!this.items.map((s) => s.id).includes(s.id)) {
        this.items.push(new Goal(s));
      } else {
        this.items.find((t) => t.id === s.id)?.update(s);
      }
    });

    return result;
  });

  @modelFlow
  addItem = _async(function* (this: GoalStore, details: GoalInterface) {
    let result;

    try {
      result = yield* _await(postItemRequest<GoalInterface>(slug, details));
    } catch (error) {
      alert(error);
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      return result;
    }

    const item = new Goal(result.data);
    this.items.push(item);

    return { details: "", ok: true, data: item };
  });

  @modelFlow
  updateItem = _async(function* (
    this: GoalStore,
    itemId: number,
    details: GoalInterface
  ) {
    let result;

    try {
      result = yield* _await(
        updateItemRequest<GoalInterface>(slug, itemId, details)
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
  deleteItem = _async(function* (this: GoalStore, itemId: number) {
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
