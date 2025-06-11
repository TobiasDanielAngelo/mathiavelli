import { model, Model, prop } from "mobx-keystone";
import { createContext, useContext } from "react";
import { TransactionAnalyticsStore } from "../analytics/TransactionAnalyticsStore";
import { AccountStore } from "./AccountStore";
import { BuyListItemStore } from "./BuyListItemStore";
import { CategoryStore } from "./CategoryStore";
import { CredentialStore } from "./CredentialStore";
import { EventStore } from "./EventStore";
import { FollowUpStore } from "./FollowUpStore";
import { GoalStore } from "./GoalStore";
import { JobStore } from "./JobStore";
import { JournalStore } from "./JournalStore";
import { PayableStore } from "./PayableStore";
import { PlatformStore } from "./PlatformStore";
import { ReceivableStore } from "./ReceivableStore";
import { TagStore } from "./TagStore";
import { TaskStore } from "./TaskStore";
import { TransactionStore } from "./TransactionStore";
import { UserStore } from "./UserStore";

@model("myApp/Store")
export class Store extends Model({
  userStore: prop<UserStore>(),
  journalStore: prop<JournalStore>(),
  accountStore: prop<AccountStore>(),
  categoryStore: prop<CategoryStore>(),
  transactionStore: prop<TransactionStore>(),
  receivableStore: prop<ReceivableStore>(),
  payableStore: prop<PayableStore>(),
  eventStore: prop<EventStore>(),
  tagStore: prop<TagStore>(),
  goalStore: prop<GoalStore>(),
  taskStore: prop<TaskStore>(),
  buyListItemStore: prop<BuyListItemStore>(),
  platformStore: prop<PlatformStore>(),
  credentialStore: prop<CredentialStore>(),
  jobStore: prop<JobStore>(),
  followUpStore: prop<FollowUpStore>(),

  transactionAnalyticsStore: prop<TransactionAnalyticsStore>(),
}) {}

export const createStore = () =>
  new Store({
    userStore: new UserStore({}),
    journalStore: new JournalStore({}),
    accountStore: new AccountStore({}),
    categoryStore: new CategoryStore({}),
    transactionStore: new TransactionStore({}),
    receivableStore: new ReceivableStore({}),
    payableStore: new PayableStore({}),
    eventStore: new EventStore({}),
    tagStore: new TagStore({}),
    goalStore: new GoalStore({}),
    taskStore: new TaskStore({}),
    buyListItemStore: new BuyListItemStore({}),
    platformStore: new PlatformStore({}),
    credentialStore: new CredentialStore({}),
    jobStore: new JobStore({}),
    followUpStore: new FollowUpStore({}),

    transactionAnalyticsStore: new TransactionAnalyticsStore({}),
  });

export const StoreContext = createContext<Store | null>(null);
export const useStore = () => useContext(StoreContext)!;
