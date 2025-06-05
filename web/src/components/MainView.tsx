import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useStore } from "../api/Store";
import { AccountView } from "./AccountComponents/AccountView";
import { DashboardView } from "./DashboardView";
import { EventView } from "./EventComponents/EventView";
import { GoalView } from "./GoalComponents/GoalView";
import { HealthView } from "./HealthView";
import { JournalView } from "./JournalComponents/JournalView";
import { NavBar } from "./NavigationBar";
import { TagView } from "./TagComponents/TagView";
import { TaskView } from "./TaskComponents/TaskView";
import { TransactionView } from "./TransactionComponents/TransactionView";

export const MainView = observer(() => {
  const [open, setOpen] = useState(false);

  const {
    userStore,
    payableStore,
    receivableStore,
    accountStore,
    categoryStore,
    goalStore,
    tagStore,
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
      payableStore.fetchAll();
      receivableStore.fetchAll();
      accountStore.fetchAll("page=all");
      categoryStore.fetchAll("page=all");
      tagStore.fetchAll("page=all");
      goalStore.fetchAll("is_completed=0&is_cancelled=0");
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
        <Route path="" element={<DashboardView />} />
        <Route path="dashboard" element={<DashboardView />} />
        <Route path="journals" element={<JournalView />} />
        <Route path="transactions" element={<TransactionView />} />
        <Route path="accounts" element={<AccountView />} />
        <Route path="events" element={<EventView />} />
        <Route path="tags" element={<TagView />} />
        <Route path="goals" element={<GoalView />} />
        <Route path="health" element={<HealthView />} />
        <Route path="tasks" element={<TaskView />} />
      </Routes>
    </div>
  );
});
