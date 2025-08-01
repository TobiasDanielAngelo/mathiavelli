import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useStore } from "../../api/Store";
import { DashboardView } from "../dashboards/DashboardView";
import { HealthView } from "../modules/HealthComponents";
import { ModularView } from "../dashboards/ModularView";
import { AccountView } from "../modules/AccountComponents";
import { BodyFatView } from "../modules/BodyFatComponents";
import { BuyListItemView } from "../modules/BuyListItemComponents";
import { CategoryView } from "../modules/CategoryComponents";
import { CredentialView } from "../modules/CredentialComponents";
import { DocumentView } from "../modules/DocumentComponents";
import { DreamView } from "../modules/DreamComponents";
import { EventView } from "../modules/EventComponents";
import { FinanceView } from "../modules/FinanceComponents";
import { FollowUpView } from "../modules/FollowUpComponents";
import { GoalView } from "../modules/GoalComponents";
import { HabitView } from "../modules/HabitComponents";
import { HabitLogView } from "../modules/HabitLogComponents";
import { InventoryCategoryView } from "../modules/InventoryCategoryComponents";
import { IssueCommentView } from "../modules/IssueCommentComponents";
import { IssueTagView } from "../modules/IssueTagComponents";
import { ItemToBringView } from "../modules/ItemToBringComponents";
import { JobView } from "../modules/JobComponents";
import { JournalView } from "../modules/JournalComponents";
import { MealView } from "../modules/MealComponents";
import { NoteView } from "../modules/NoteComponents";
import { PayableView } from "../modules/PayableComponents";
import { PersonalItemView } from "../modules/PersonalItemComponents";
import { PlatformView } from "../modules/PlatformComponents";
import { ReceivableView } from "../modules/ReceivableComponents";
import { RequirementView } from "../modules/RequirementComponents";
import { ScheduleView } from "../modules/ScheduleComponents";
import { SettingView } from "../modules/SettingComponents";
import { TagView } from "../modules/TagComponents";
import { TaskView } from "../modules/TaskComponents";
import { TicketView } from "../modules/TicketComponents";
import { TransactionView } from "../modules/TransactionComponents";
import { TravelPlanView } from "../modules/TravelPlanComponents";
import { WaistMeasurementView } from "../modules/WaistMeasurementComponents";
import { WeighInView } from "../modules/WeighInComponents";
import { WorkoutView } from "../modules/WorkoutComponents";
import { NavBar } from "./NavigationBar";
import { TestingView } from "../dashboards/TestingView";

export const MainView = observer(() => {
  const store = useStore();
  const {
    // userStore,
    accountStore,
    categoryStore,
    goalStore,
    tagStore,
    platformStore,
    jobStore,
    taskStore,
    inventoryCategoryStore,
    transactionAnalyticsStore,
    weighInAnalyticsStore,
    scheduleStore,
    settingStore,
  } = store;

  const navigate = useNavigate();

  const fetchAll = async () => {
    const arr = await Promise.all([
      transactionAnalyticsStore.fetchAll(),
      weighInAnalyticsStore.fetchAll(),
      platformStore.fetchAll("page=all"),
      accountStore.fetchAll("page=all"),
      categoryStore.fetchAll("page=all"),
      tagStore.fetchAll("page=all"),
      inventoryCategoryStore.fetchAll("page=all"),
      goalStore.fetchAll("page=all&is_archived=0"),
      jobStore.fetchAll("page=all&status__lte=5"),
      taskStore.fetchAll("page=all&is_archived=0"),
      scheduleStore.fetchAll("page=all"),
      settingStore.fetchAll("page=all"),
    ]);
    if (!arr.every((item) => item.ok)) {
      navigate("/login");
    }
  };

  // const subscribeToStore = () => {
  //   taskStore.setSubscription(true);
  // };

  // const getSubscriptions = () => {
  //   const allStoreKeys = Object.keys(store.$);
  //   const allStores = allStoreKeys
  //     .map((s) => store[s as keyof typeof store] as unknown as IStore)
  //     .filter((s) => s.isSubscribed);
  //   allStores.forEach((s) => s.checkUpdated(s.lastUpdated));
  // };

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     getSubscriptions();
  //   }, 10000);

  //   return () => clearInterval(interval);
  // });

  useEffect(() => {
    // subscribeToStore();
    fetchAll();
  }, []);

  useEffect(() => {
    if (settingStore.theme() === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settingStore.theme()]);

  return (
    <div className="flex flex-col min-h-screen text-teal-700 dark:text-gray-400">
      <NavBar />
      <Routes>
        <Route path="menu" element={<ModularView />} />
        <Route path="" element={<DashboardView />} />
        <Route path="dashboard" element={<DashboardView />} />
        <Route path="journals" element={<JournalView />} />
        <Route path="dreams" element={<DreamView />} />
        <Route path="transactions" element={<TransactionView />} />
        <Route path="categories" element={<CategoryView />} />
        <Route path="accounts" element={<AccountView />} />
        <Route path="events" element={<EventView />} />
        <Route path="tags" element={<TagView />} />
        <Route path="goals" element={<GoalView />} />
        <Route path="receivables" element={<ReceivableView />} />
        <Route path="payables" element={<PayableView />} />
        <Route path="health" element={<HealthView />} />
        <Route path="tasks" element={<TaskView />} />
        <Route path="wishlist" element={<BuyListItemView />} />
        <Route path="credentials" element={<CredentialView />} />
        <Route path="platforms" element={<PlatformView />} />
        <Route path="jobs" element={<JobView />} />
        <Route path="follow-ups" element={<FollowUpView />} />
        <Route path="body-fats" element={<BodyFatView />} />
        <Route path="waist-measure" element={<WaistMeasurementView />} />
        <Route path="meals" element={<MealView />} />
        <Route path="weigh-ins" element={<WeighInView />} />
        <Route path="workouts" element={<WorkoutView />} />
        <Route path="inventory-types" element={<InventoryCategoryView />} />
        <Route path="inventory" element={<PersonalItemView />} />
        <Route path="finance" element={<FinanceView />} />
        <Route path="habits" element={<HabitView />} />
        <Route path="logs" element={<HabitLogView />} />
        <Route path="schedules" element={<ScheduleView />} />
        <Route path="settings" element={<SettingView />} />
        <Route path="issue-comments" element={<IssueCommentView />} />
        <Route path="issue-tags" element={<IssueTagView />} />
        <Route path="tickets" element={<TicketView />} />
        <Route path="notes" element={<NoteView />} />
        <Route path="travel-plans" element={<TravelPlanView />} />
        <Route path="bring-items" element={<ItemToBringView />} />
        <Route path="travel-requirements" element={<RequirementView />} />
        <Route path="test" element={<TestingView />} />
        <Route path="documents" element={<DocumentView />} />
      </Routes>
    </div>
  );
});
