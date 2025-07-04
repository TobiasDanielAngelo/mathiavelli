import { computed } from "mobx";
import { Model, _async, _await, model, modelFlow, prop } from "mobx-keystone";
import Swal from "sweetalert2";
import {
  deleteItemRequest,
  fetchItemsRequest,
  postItemRequest,
  updateItemRequest,
} from "./_apiHelpers";
import {
  generateCollidingDates,
  generateScheduleDefinition,
} from "../constants/helpers";
import { formatValue } from "../constants/JSXHelpers";

const slug = "productivity/schedules";

const props = {
  id: prop<number>(-1),
  name: prop<string>(""),
  freq: prop<number>(0),
  interval: prop<number>(0),
  byWeekDay: prop<string[]>(() => []),
  byMonthDay: prop<number[]>(() => []),
  byMonth: prop<number[]>(() => []),
  byYearDay: prop<number[]>(() => []),
  byWeekNo: prop<number[]>(() => []),
  byHour: prop<number[]>(() => []),
  byMinute: prop<number[]>(() => []),
  bySecond: prop<number[]>(() => []),
  bySetPosition: prop<number[]>(() => []),
  count: prop<number | null>(null),
  startDate: prop<string>(""),
  endDate: prop<string>(""),
  weekStart: prop<number>(0),
  startTime: prop<string>(""),
  endTime: prop<string>(""),
};

export const FREQ_CHOICES = [
  "Yearly",
  "Monthly",
  "Weekly",
  "Daily",
  "Hourly",
  "Minutely",
  "Secondly",
];
export const WEEKDAY_CHOICES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export type ScheduleInterface = {
  [K in keyof typeof props]?: (typeof props)[K] extends ReturnType<
    typeof prop<infer T>
  >
    ? T
    : never;
};

export const ScheduleFields: Record<string, (keyof ScheduleInterface)[]> = {
  datetimeFields: [] as const,
  dateFields: ["startDate", "endDate"] as const,
  timeFields: ["startTime", "endTime"] as const,
  pricesFields: [] as const,
};

@model("myApp/Schedule")
export class Schedule extends Model(props) {
  update(details: ScheduleInterface) {
    Object.assign(this, details);
  }

  get freqName() {
    return FREQ_CHOICES.find((_, ind) => ind === this.freq) ?? "—";
  }
  get weekStartName() {
    return WEEKDAY_CHOICES.find((_, ind) => ind === this.weekStart) ?? "—";
  }

  get collidingDates() {
    return formatValue(
      generateCollidingDates(this),
      "",
      [],
      undefined,
      this.count === 0 || this.count === null ? true : false
    );
  }

  get definition() {
    return generateScheduleDefinition(this);
  }
  get $view() {
    return {
      ...this.$,
      freqName: FREQ_CHOICES.find((_, ind) => ind === this.freq) ?? "—",
      weekStartName:
        WEEKDAY_CHOICES.find((_, ind) => ind === this.weekStart) ?? "—",
      collidingDates: this.collidingDates,
      definition: this.definition,
    };
  }
}

@model("myApp/ScheduleStore")
export class ScheduleStore extends Model({
  items: prop<Schedule[]>(() => []),
}) {
  @computed
  get itemsSignature() {
    const keys = Object.keys(
      new Schedule({}).$view
    ) as (keyof ScheduleInterface)[];
    return this.items
      .map((item) => keys.map((key) => String(item[key])).join("|"))
      .join("::");
  }

  @computed
  get allItems() {
    const map = new Map<number, Schedule>();
    this.items.forEach((item) => map.set(item.id, item));
    return map;
  }

  @modelFlow
  fetchAll = _async(function* (this: ScheduleStore, params?: string) {
    let result;

    try {
      result = yield* _await(fetchItemsRequest<Schedule>(slug, params));
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
        this.items.push(new Schedule(s));
      } else {
        this.items.find((t) => t.id === s.id)?.update(s);
      }
    });

    return result;
  });

  @modelFlow
  addItem = _async(function* (this: ScheduleStore, details: ScheduleInterface) {
    let result;

    try {
      result = yield* _await(postItemRequest<ScheduleInterface>(slug, details));
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

    const item = new Schedule(result.data);
    this.items.push(item);

    return { details: "", ok: true, data: item };
  });

  @modelFlow
  updateItem = _async(function* (
    this: ScheduleStore,
    itemId: number,
    details: ScheduleInterface
  ) {
    let result;

    try {
      result = yield* _await(
        updateItemRequest<ScheduleInterface>(slug, itemId, details)
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
  deleteItem = _async(function* (this: ScheduleStore, itemId: number) {
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
