import { createContext, useContext } from 'react'
import { JournalStore } from './JournalStore'

export class Store {
  journalStore: JournalStore

  constructor() {
    this.journalStore = new JournalStore({})
  }
}

export const createStore = () => {
  const store = new Store()
  return store
}

export const StoreContext = createContext<Store>(createStore())

export const useStore = () => useContext(StoreContext)
