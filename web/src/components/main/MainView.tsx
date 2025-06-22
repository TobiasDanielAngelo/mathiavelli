import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useStore } from "../../api/Store";
import { DashboardView } from "../dashboards/DashboardView";
import { HealthView } from "../dashboards/HealthView";
import { ModularView } from "../dashboards/ModularView";
import { AccountView } from "../modules/AccountComponents";
import { BodyFatView } from "../modules/BodyFatComponents";
import { BuyListItemView } from "../modules/BuyListItemComponents";
import { CategoryView } from "../modules/CategoryComponents";
import { CredentialView } from "../modules/CredentialComponents";
import { EventView } from "../modules/EventComponents";
import { FollowUpView } from "../modules/FollowUpComponents";
import { GoalView } from "../modules/GoalComponents";
import { HabitView } from "../modules/HabitComponents";
import { HabitLogView } from "../modules/HabitLogComponents";
import { InventoryCategoryView } from "../modules/InventoryCategoryComponents";
import { JobView } from "../modules/JobComponents";
import { JournalView } from "../modules/JournalComponents";
import { MealView } from "../modules/MealComponents";
import { PayableView } from "../modules/PayableComponents";
import { PersonalItemView } from "../modules/PersonalItemComponents";
import { PlatformView } from "../modules/PlatformComponents";
import { ReceivableView } from "../modules/ReceivableComponents";
import { ScheduleView } from "../modules/ScheduleComponents";
import { TagView } from "../modules/TagComponents";
import { TaskView } from "../modules/TaskComponents";
import { TransactionView } from "../modules/TransactionComponents";
import { WaistMeasurementView } from "../modules/WaistMeasurementComponents";
import { WeighInView } from "../modules/WeighInComponents";
import { WorkoutView } from "../modules/WorkoutComponents";
import { NavBar } from "./NavigationBar";

export const MainView = observer(() => {
  const [open, setOpen] = useState(false);

  const {
    userStore,
    accountStore,
    categoryStore,
    goalStore,
    tagStore,
    platformStore,
    jobStore,
    taskStore,
    inventoryCategoryStore,
    transactionAnalyticsStore,
    scheduleStore,
  } = useStore();

  const navigate = useNavigate();

  const adminElements = document.getElementsByClassName("admin");
  for (let i = 0; i < adminElements.length; i++) {
    adminElements[i].className = "hidden";
  }

  const reauthUser = async () => {
    const resp = await userStore.reauthUser();
    if (!resp.ok) {
      navigate("/login");
    } else {
      transactionAnalyticsStore.fetchAll();
      platformStore.fetchAll("page=all");
      accountStore.fetchAll("page=all");
      categoryStore.fetchAll("page=all");
      tagStore.fetchAll("page=all");
      inventoryCategoryStore.fetchAll("page=all");
      goalStore.fetchAll("page=all&is_archived=0");
      jobStore.fetchAll("page=all&status__lte=3");
      taskStore.fetchAll("page=all&is_archived=0");
      scheduleStore.fetchAll("page=all");
    }
  };

  useEffect(() => {
    reauthUser();
    return () => {
      setOpen(false);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar open={open} setOpen={setOpen} />
      <Routes>
        <Route path="" element={<ModularView />} />
        <Route path="dashboard" element={<DashboardView />} />
        <Route path="journals" element={<JournalView />} />
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
        <Route
          path="inventory-categories"
          element={<InventoryCategoryView />}
        />
        <Route path="personal-items" element={<PersonalItemView />} />
        <Route path="habits" element={<HabitView />} />
        <Route path="habit-logs" element={<HabitLogView />} />
        <Route path="schedules" element={<ScheduleView />} />
      </Routes>
    </div>
  );
});
