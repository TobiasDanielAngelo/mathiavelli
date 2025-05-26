import { model, Model, prop } from "mobx-keystone";
import { GoalStore } from "./GoalStore";
import { TaskStore } from "./TaskStore";
import { createContext, useContext } from "react";
import { UserStore } from "./UserStore";
import { JournalStore } from "./JournalStore";
import { AccountStore } from "./AccountStore";
import { CategoryStore } from "./CategoryStore";
import { TransactionStore } from "./TransactionStore";
import { ReceivableStore } from "./ReceivableStore";
import { PayableStore } from "./PayableStore";
import { EventStore } from "./EventStore";
import { TagStore } from "./TagStore";

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
  });

export const StoreContext = createContext<Store | null>(null);
export const useStore = () => useContext(StoreContext)!;
