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
import { WeighInStore } from "./WeighInStore";
import { BodyFatStore } from "./BodyFatStore";
import { WaistMeasurementStore } from "./WaistMeasurementStore";
import { MealStore } from "./MealStore";
import { WorkoutStore } from "./WorkoutStore";
import { PersonalItemStore } from "./PersonalItemStore";
import { ScheduleStore } from "./ScheduleStore";
import { HabitStore } from "./HabitStore";
import { HabitLogStore } from "./HabitLogStore";
import { InventoryCategoryStore } from "./InventoryCategoryStore";

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
  weighInStore: prop<WeighInStore>(),
  bodyFatStore: prop<BodyFatStore>(),
  waistMeasurementStore: prop<WaistMeasurementStore>(),
  mealStore: prop<MealStore>(),
  workoutStore: prop<WorkoutStore>(),
  transactionAnalyticsStore: prop<TransactionAnalyticsStore>(),
  personalItemStore: prop<PersonalItemStore>(),
  inventoryCategoryStore: prop<InventoryCategoryStore>(),
  scheduleStore: prop<ScheduleStore>(),
  habitStore: prop<HabitStore>(),
  habitLogStore: prop<HabitLogStore>(),
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
    weighInStore: new WeighInStore({}),
    bodyFatStore: new BodyFatStore({}),
    waistMeasurementStore: new WaistMeasurementStore({}),
    mealStore: new MealStore({}),
    workoutStore: new WorkoutStore({}),
    transactionAnalyticsStore: new TransactionAnalyticsStore({}),
    personalItemStore: new PersonalItemStore({}),
    inventoryCategoryStore: new InventoryCategoryStore({}),
    scheduleStore: new ScheduleStore({}),
    habitStore: new HabitStore({}),
    habitLogStore: new HabitLogStore({}),
  });

export const StoreContext = createContext<Store | null>(null);
export const useStore = () => useContext(StoreContext)!;
