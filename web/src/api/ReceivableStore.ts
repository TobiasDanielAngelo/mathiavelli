import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { GenerateModel, GenerateStore, getStoreItem } from "./GenericStore";

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

const derivedProps = (item: ReceivableInterface) => ({
  paymentDescription: item.payment?.map(
    (s) => getStoreItem(item, "transactionStore", s)?.description ?? "-"
  ),
});

export type ReceivableInterface = PropsToInterface<typeof props>;
export class Receivable extends GenerateModel(props, derivedProps, keyName) {}
export class ReceivableStore extends GenerateStore(Receivable, slug, keyName) {}
export const ReceivableFields: ViewFields<ReceivableInterface> = {
  datetimeFields: ["datetimeOpened", "datetimeDue", "datetimeClosed"] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: ["lentAmount", "paymentTotal"] as const,
};
