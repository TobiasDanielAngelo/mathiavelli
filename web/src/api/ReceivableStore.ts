import { Model, getRoot, model, prop } from "mobx-keystone";
import { createGenericStore } from "./GenericStore";
import { Store } from "./Store";

const slug = "finance/receivables";

const props = {
  id: prop<number>(-1),
  payment: prop<number[] | null>(null),
  borrowerName: prop<string>(""),
  lentAmount: prop<number>(0),
  description: prop<string>(""),
  datetimeOpened: prop<string>(""),
  datetimeDue: prop<string>(""),
  datetimeClosed: prop<string>(""),
  isActive: prop<boolean>(false),
  paymentTotal: prop<number>(0),
};

export type ReceivableInterface = {
  [K in keyof typeof props]?: (typeof props)[K] extends ReturnType<
    typeof prop<infer T>
  >
    ? T
    : never;
};

export const ReceivableFields: Record<string, (keyof ReceivableInterface)[]> = {
  datetimeFields: ["datetimeOpened", "datetimeDue", "datetimeClosed"] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: ["lentAmount", "paymentTotal"] as const,
};

@model("myApp/Receivable")
export class Receivable extends Model(props) {
  update(details: ReceivableInterface) {
    Object.assign(this, details);
  }

  // get paymentDescription() {
  //   return this.payment?.map(
  //     (s) =>
  //       getRoot<Store>(this)?.transactionStore?.allItems.get(s)?.description ??
  //       ""
  //   );
  // }

  get $view() {
    return {
      ...this.$,
      paymentDescription: this.payment?.map(
        (s) =>
          getRoot<Store>(this)?.transactionStore?.allItems.get(s)
            ?.description ?? ""
      ),
    };
  }
}

@model("myApp/ReceivableStore")
export class ReceivableStore extends createGenericStore<
  ReceivableInterface,
  Receivable
>(Receivable, slug) {}
