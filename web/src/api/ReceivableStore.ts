import { model, prop } from "mobx-keystone";
import { PropsToInterface } from "../constants/interfaces";
import {
  createGenericModel,
  createGenericStore,
  getStoreItem,
} from "./GenericStore";

const slug = "finance/receivables";
const keyName = "Receivable";

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

export type ReceivableInterface = PropsToInterface<typeof props>;

const extendView = (item: ReceivableInterface) => ({
  paymentDescription: item.payment?.map(
    (s) => getStoreItem(item, "transactionStore", s)?.description ?? ""
  ),
});

@model(`myApp/${keyName}`)
export class Receivable extends createGenericModel(props, extendView) {}

@model(`myApp/${keyName}Store`)
export class ReceivableStore extends createGenericStore<
  ReceivableInterface,
  Receivable
>(Receivable, slug) {}

export const ReceivableFields: Record<string, (keyof ReceivableInterface)[]> = {
  datetimeFields: ["datetimeOpened", "datetimeDue", "datetimeClosed"] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: ["lentAmount", "paymentTotal"] as const,
};
