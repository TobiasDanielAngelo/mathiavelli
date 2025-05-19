import { createContext, useContext } from "react";
import { accountStore } from "./AccountStore";
import { categoryStore } from "./CategoryStore";
import { eventStore } from "./EventStore";
import { journalStore } from "./JournalStore";
import { payableStore } from "./PayableStore";
import { receivableStore } from "./ReceivableStore";
import { tagStore } from "./TagStore";
import { transactionStore } from "./TransactionStore";
import { userStore } from "./UserStore";
import { goalStore } from "./GoalStore";
import { taskStore } from "./TaskStore";

export class Store {
  userStore = userStore;
  journalStore = journalStore;
  accountStore = accountStore;
  categoryStore = categoryStore;
  transactionStore = transactionStore;
  receivableStore = receivableStore;
  payableStore = payableStore;
  eventStore = eventStore;
  tagStore = tagStore;
  goalStore = goalStore;
  taskStore = taskStore;
}

export const createStore = () => new Store();
export const StoreContext = createContext(createStore());
export const useStore = () => useContext(StoreContext);
