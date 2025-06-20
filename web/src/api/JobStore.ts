import { computed } from "mobx";
import { Model, _async, _await, model, modelFlow, prop } from "mobx-keystone";
import {
  deleteItemRequest,
  fetchItemsRequest,
  postItemRequest,
  updateItemRequest,
} from "./_apiHelpers";
import Swal from "sweetalert2";

const slug = "career/jobs";

const props = {
  id: prop<number>(-1),
  title: prop<string>(""),
  company: prop<string>(""),
  location: prop<string>(""),
  link: prop<string>(""),
  salary: prop<string>(""),
  deadline: prop<string>(""),
  appliedDate: prop<string>(""),
  notes: prop<string>(""),
  createdAt: prop<string>(""),
  updatedAt: prop<string>(""),
  source: prop<number>(0),
  status: prop<number>(0),
  workSetup: prop<number>(0),
  jobType: prop<number>(0),
};

export const STATUS_CHOICES = [
  "Wishlist",
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
  "Accepted",
];
export const SOURCE_CHOICES = [
  "Walk-in",
  "LinkedIn",
  "Indeed",
  "Glassdoor",
  "JobStreet",
  "Referral",
  "Company Website",
  "Facebook",
  "Twitter / X",
  "Other",
];
export const WORK_SETUP_CHOICES = ["On-site", "Remote", "Hybrid"];
export const JOB_TYPE_CHOICES = [
  "Full-time",
  "Part-time",
  "Freelance",
  "Contract",
  "Internship",
  "Temporary",
];

export type JobInterface = {
  [K in keyof typeof props]?: (typeof props)[K] extends ReturnType<
    typeof prop<infer T>
  >
    ? T
    : never;
};

export const JobFields: Record<string, (keyof JobInterface)[]> = {
  datetime: ["createdAt", "updatedAt"] as const,
  date: ["deadline", "appliedDate"] as const,
  time: [] as const,
  prices: [] as const,
};

@model("myApp/Job")
export class Job extends Model(props) {
  update(details: JobInterface) {
    Object.assign(this, details);
  }

  get sourceName() {
    return SOURCE_CHOICES.find((_, ind) => ind === this.source) ?? "—";
  }
  get statusName() {
    return STATUS_CHOICES.find((_, ind) => ind === this.status) ?? "—";
  }
  get workSetupName() {
    return WORK_SETUP_CHOICES.find((_, ind) => ind === this.workSetup) ?? "—";
  }
  get jobTypeName() {
    return JOB_TYPE_CHOICES.find((_, ind) => ind === this.jobType) ?? "—";
  }

  get $view() {
    return {
      ...this.$,
      sourceName: SOURCE_CHOICES.find((_, ind) => ind === this.source) ?? "—",
      statusName: STATUS_CHOICES.find((_, ind) => ind === this.status) ?? "—",
      workSetupName:
        WORK_SETUP_CHOICES.find((_, ind) => ind === this.workSetup) ?? "—",
      jobTypeName:
        JOB_TYPE_CHOICES.find((_, ind) => ind === this.jobType) ?? "—",
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
  deleteItem = _async(function* (this: JobStore, itemId: number) {
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
