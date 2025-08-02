import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { MyModel, MyStore } from "./GenericStore";

const slug = "finance/payables/";
const keyName = "Payable";
const props = {
  id: prop<number | string>(-1),
  createdAt: prop<string>(""),
  updatedAt: prop<string>(""),
  payment: prop<number[] | null>(null),
  lenderName: prop<string>(""),
  datetimeOpened: prop<string>(""),
  datetimeDue: prop<string>(""),
  description: prop<string>(""),
  datetimeClosed: prop<string>(""),
  borrowedAmount: prop<number>(0),
  isActive: prop<boolean>(false),
  paymentTotal: prop<number>(0),
};

export type PayableInterface = PropsToInterface<typeof props>;
export class Payable extends MyModel(keyName, props) {}
export class PayableStore extends MyStore(keyName, Payable, slug) {}
export const PayableFields: ViewFields<PayableInterface> = {
  datetimeFields: [
    "createdAt",
    "updatedAt",
    "datetimeOpened",
    "datetimeDue",
    "datetimeClosed",
  ] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: ["borrowedAmount", "paymentTotal"] as const,
};
