import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { getStoreItem, MyModel, MyStore } from "./GenericStore";

const slug = "finance/transactions/";
const keyName = "Transaction";
const props = {
  id: prop<number>(-1),
  category: prop<number | null>(null),
  description: prop<string>(""),
  transmitter: prop<number | null>(null),
  receiver: prop<number | null>(null),
  amount: prop<number>(0),
  datetimeTransacted: prop<string>(""),
  receivableId: prop<number | null>(null),
  payableId: prop<number | null>(null),
};

const derivedProps = (item: TransactionInterface) => ({
  categoryTitle:
    getStoreItem(item, "categoryStore", item.category)?.title || "—",
  transmitterName:
    getStoreItem(item, "accountStore", item.transmitter)?.name || "—",
  receiverName: getStoreItem(item, "accountStore", item.receiver)?.name || "—",
});

export type TransactionInterface = PropsToInterface<typeof props>;
export class Transaction extends MyModel(keyName, props, derivedProps) {}
export class TransactionStore extends MyStore(keyName, Transaction, slug) {}
export const TransactionFields: ViewFields<TransactionInterface> = {
  datetimeFields: ["datetimeTransacted"] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: ["amount"] as const,
};
