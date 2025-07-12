import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { MyModel, MyStore } from "./GenericStore";

const slug = "finance/accounts/";
const keyName = "Account";
const props = {
  id: prop<number | string>(-1),
  name: prop<string>(""),
  datetimeAdded: prop<string>(""),
};

export type AccountInterface = PropsToInterface<typeof props>;
export class Account extends MyModel(keyName, props) {}
export class AccountStore extends MyStore(keyName, Account, slug) {}

export const AccountFields: ViewFields<AccountInterface> = {
  datetimeFields: ["datetimeAdded"] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
