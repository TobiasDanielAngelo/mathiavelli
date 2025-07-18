import { model, Model, prop } from "mobx-keystone";
import { createContext, useContext } from "react";
import { TransactionAnalyticsStore } from "../analytics/TransactionAnalyticsStore";
import { AccountStore } from "./AccountStore";
import { BodyFatStore } from "./BodyFatStore";
import { BuyListItemStore } from "./BuyListItemStore";
import { CategoryStore } from "./CategoryStore";
import { CredentialStore } from "./CredentialStore";
import { EventStore } from "./EventStore";
import { FollowUpStore } from "./FollowUpStore";
import { GoalStore } from "./GoalStore";
import { HabitLogStore } from "./HabitLogStore";
import { HabitStore } from "./HabitStore";
import { InventoryCategoryStore } from "./InventoryCategoryStore";
import { IssueCommentStore } from "./IssueCommentStore";
import { IssueTagStore } from "./IssueTagStore";
import { JobStore } from "./JobStore";
import { JournalStore } from "./JournalStore";
import { MealStore } from "./MealStore";
import { PayableStore } from "./PayableStore";
import { PersonalItemStore } from "./PersonalItemStore";
import { PlatformStore } from "./PlatformStore";
import { ReceivableStore } from "./ReceivableStore";
import { ScheduleStore } from "./ScheduleStore";
import { SettingStore } from "./SettingStore";
import { TagStore } from "./TagStore";
import { TaskStore } from "./TaskStore";
import { TicketStore } from "./TicketStore";
import { TransactionStore } from "./TransactionStore";
import { UserStore } from "./UserStore";
import { WaistMeasurementStore } from "./WaistMeasurementStore";
import { WeighInStore } from "./WeighInStore";
import { WorkoutStore } from "./WorkoutStore";
import { NoteStore } from "./NoteStore";
import { WeighInAnalyticsStore } from "../analytics/WeighInAnalyticsStore";
import { DreamStore } from "./DreamStore";
import { DocumentStore } from "./DocumentStore";
import { TravelPlanStore } from "./TravelPlanStore";
import { ItemToBringStore } from "./ItemToBringStore";
import { RequirementStore } from "./RequirementStore";

@model("myApp/Store")
export class Store extends Model({
  userStore: prop<UserStore>(),
  journalStore: prop<JournalStore>(),
  dreamStore: prop<DreamStore>(),
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
  weighInAnalyticsStore: prop<WeighInAnalyticsStore>(),
  personalItemStore: prop<PersonalItemStore>(),
  inventoryCategoryStore: prop<InventoryCategoryStore>(),
  scheduleStore: prop<ScheduleStore>(),
  habitStore: prop<HabitStore>(),
  habitLogStore: prop<HabitLogStore>(),
  settingStore: prop<SettingStore>(),
  ticketStore: prop<TicketStore>(),
  issueTagStore: prop<IssueTagStore>(),
  issueCommentStore: prop<IssueCommentStore>(),
  noteStore: prop<NoteStore>(),
  documentStore: prop<DocumentStore>(),
  itemToBringStore: prop<ItemToBringStore>(),
  travelPlanStore: prop<TravelPlanStore>(),
  requirementStore: prop<RequirementStore>(),
}) {}

export const createStore = () =>
  new Store({
    userStore: new UserStore({}),
    journalStore: new JournalStore({}),
    dreamStore: new DreamStore({}),
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
    weighInAnalyticsStore: new WeighInAnalyticsStore({}),
    personalItemStore: new PersonalItemStore({}),
    inventoryCategoryStore: new InventoryCategoryStore({}),
    scheduleStore: new ScheduleStore({}),
    habitStore: new HabitStore({}),
    habitLogStore: new HabitLogStore({}),
    settingStore: new SettingStore({}),
    issueTagStore: new IssueTagStore({}),
    issueCommentStore: new IssueCommentStore({}),
    ticketStore: new TicketStore({}),
    noteStore: new NoteStore({}),
    documentStore: new DocumentStore({}),
    itemToBringStore: new ItemToBringStore({}),
    travelPlanStore: new TravelPlanStore({}),
    requirementStore: new RequirementStore({}),
  });

export const StoreContext = createContext<Store | null>(null);
export const useStore = () => useContext(StoreContext)!;
