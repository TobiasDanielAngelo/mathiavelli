import { computed } from "mobx";
import { Model, _async, _await, model, modelFlow, prop } from "mobx-keystone";
import {
  deleteItemRequest,
  fetchItemsRequest,
  postItemRequest,
  updateItemRequest,
} from "../constants/storeHelpers";
import {
  jobSources,
  jobStatuses,
  jobTypes,
  workSetups,
} from "../constants/constants";

const slug = "jobs";

const props = {
  id: prop<number>(-1),
  title: prop<string>(""),
  company: prop<string>(""),
  location: prop<string>(""),
  link: prop<string>(""),
  salary: prop<string>(""),
  deadline: prop<string>(""),
  source: prop<number | null>(null),
  status: prop<number | null>(null),
  workSetup: prop<number | null>(null),
  jobType: prop<number | null>(null),
  appliedDate: prop<string>(""),
  notes: prop<string>(""),
  createdAt: prop<string>(""),
  updatedAt: prop<string>(""),
};

export type JobInterface = {
  [K in keyof typeof props]?: (typeof props)[K] extends ReturnType<
    typeof prop<infer T>
  >
    ? T
    : never;
};

@model("myApp/Job")
export class Job extends Model(props) {
  update(details: JobInterface) {
    Object.assign(this, details);
  }
  get sourceName() {
    return jobSources.find((_, ind) => ind === this.source) ?? "—";
  }
  get statusName() {
    return jobStatuses.find((_, ind) => ind === this.status) ?? "—";
  }
  get workSetupName() {
    return workSetups.find((_, ind) => ind === this.workSetup) ?? "—";
  }
  get jobTypeName() {
    return jobTypes.find((_, ind) => ind === this.jobType) ?? "—";
  }

  get $view() {
    return {
      ...this.$,
      sourceName: this.sourceName,
      statusName: this.statusName,
      workSetupName: this.workSetupName,
      jobTypeName: this.jobTypeName,
    };
  }
}

@model("myApp/JobStore")
export class JobStore extends Model({
  items: prop<Job[]>(() => []),
}) {
  @computed
  get itemsSignature() {
    const keys = Object.keys(new Job({}).$) as (keyof JobInterface)[];
    return this.items
      .map((item) => keys.map((key) => String(item[key])).join("|"))
      .join("::");
  }

  @computed
  get allItems() {
    const map = new Map<number, Job>();
    this.items.forEach((item) => map.set(item.id, item));
    return map;
  }

  @modelFlow
  fetchAll = _async(function* (this: JobStore, params?: string) {
    let result;

    try {
      result = yield* _await(fetchItemsRequest<Job>(slug, params));
    } catch (error) {
      alert(error);
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      return result;
    }

    result.data.forEach((s) => {
      if (!this.items.map((s) => s.id).includes(s.id)) {
        this.items.push(new Job(s));
      } else {
        this.items.find((t) => t.id === s.id)?.update(s);
      }
    });

    return result;
  });

  @modelFlow
  addItem = _async(function* (this: JobStore, details: JobInterface) {
    let result;

    try {
      result = yield* _await(postItemRequest<JobInterface>(slug, details));
    } catch (error) {
      alert(error);
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      return result;
    }

    const item = new Job(result.data);
    this.items.push(item);

    return { details: "", ok: true, data: item };
  });

  @modelFlow
  updateItem = _async(function* (
    this: JobStore,
    itemId: number,
    details: JobInterface
  ) {
    let result;

    try {
      result = yield* _await(
        updateItemRequest<JobInterface>(slug, itemId, details)
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
  deleteItem = _async(function* (this: JobStore, itemId: number) {
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
