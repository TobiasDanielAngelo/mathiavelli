import { prop } from "mobx-keystone";
import { MyModel, MyStore } from "../api/GenericStore";
import { GraphType, PropsToInterface } from "../constants/interfaces";

const slug = "finance/analytics/transactions/";
const keyName = "TransactionAnalytics";
const props = {
  id: prop<string | number>(""),
  graph: prop<GraphType>("pie"),
  category: prop<number | null>(null),
  categoryNature: prop<number | null>(null),
  account: prop<number | null>(null),
  period: prop<string | null>(null),
  incoming: prop<number>(0),
  outgoing: prop<number>(0),
  total: prop<number>(0),
};

export type TransactionAnalyticsInterface = PropsToInterface<typeof props>;
export class TransactionAnalytics extends MyModel(keyName, props) {}
export class TransactionAnalyticsStore extends MyStore(
  keyName,
  TransactionAnalytics,
  slug
) {}
