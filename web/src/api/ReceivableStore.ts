import { model, prop } from "mobx-keystone";
import { PropsToInterface } from "../constants/interfaces";
import { createGenericModel, createGenericStore } from "./GenericStore";

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

@model("myApp/Receivable")
export class Receivable extends createGenericModel(props) {}

export const ReceivableFields: Record<string, (keyof ReceivableInterface)[]> = {
  datetimeFields: ["datetimeOpened", "datetimeDue", "datetimeClosed"] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: ["lentAmount", "paymentTotal"] as const,
};

@model(`myApp/${keyName}Store`)
export class ReceivableStore extends createGenericStore<
  ReceivableInterface,
  Receivable
>(Receivable, slug) {}
