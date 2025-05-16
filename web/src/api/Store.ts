import { createContext, useContext } from "react";
import { JournalStore } from "./JournalStore";
import { UserStore } from "./UserStore";
import { AccountStore } from "./AccountStore";
import { CategoryStore } from "./CategoryStore";
import { TransactionStore } from "./TransactionStore";
import { ReceivableStore } from "./ReceivableStore";
import { PayableStore } from "./PayableStore";

export class Store {
  journalStore: JournalStore;
  accountStore: AccountStore;
  categoryStore: CategoryStore;
  transactionStore: TransactionStore;
  receivableStore: ReceivableStore;
  payableStore: PayableStore;
  userStore: UserStore;
  constructor() {
    this.journalStore = new JournalStore({});
    this.accountStore = new AccountStore({});
    this.categoryStore = new CategoryStore({});
    this.transactionStore = new TransactionStore({});
    this.receivableStore = new ReceivableStore({});
    this.payableStore = new PayableStore({});
    this.userStore = new UserStore({});
  }
}

export const createStore = () => {
  const store = new Store();
  return store;
};

export const StoreContext = createContext<Store>(createStore());

export const useStore = () => useContext(StoreContext);
