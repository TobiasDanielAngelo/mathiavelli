import { prop } from "mobx-keystone";
import { MyModel, MyStore } from "../api/GenericStore";
import { GraphType, PropsToInterface } from "../constants/interfaces";

const slug = "health/analytics/weigh-ins/";
const keyName = "WeighInAnalytics";
const props = {
  id: prop<string | number>(""),
  graph: prop<GraphType>("pie"),
  aveWeight: prop<number | null>(null),
  period: prop<string | null>(null),
};

export type WeighInAnalyticsInterface = PropsToInterface<typeof props>;
export class WeighInAnalytics extends MyModel(keyName, props) {}
export class WeighInAnalyticsStore extends MyStore(
  keyName,
  WeighInAnalytics,
  slug
) {}
