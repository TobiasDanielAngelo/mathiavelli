import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useStore } from "../api/Store";
import { DashboardView } from "./DashboardView";
import { EventView } from "./EventView";
import { FinanceView } from "./FinanceView";
import { GoalView } from "./GoalView";
import { HealthView } from "./HealthView";
import { JournalView } from "./JournalView";
import { NavBar } from "./NavigationBar";
import { TaskTableView } from "./TaskTableView";

export const MainView = observer(() => {
  const [open, setOpen] = useState(false);

  const {
    userStore,
    journalStore,
    accountStore,
    transactionStore,
    categoryStore,
    payableStore,
    receivableStore,
    eventStore,
    tagStore,
    goalStore,
    taskStore,
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
      categoryStore.fetchAll();
      transactionStore.fetchAll();
      accountStore.fetchAll();
      journalStore.fetchAll();
      payableStore.fetchAll();
      receivableStore.fetchAll();
      eventStore.fetchAll();
      tagStore.fetchAll();
      goalStore.fetchAll();
      taskStore.fetchAll();
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
        <Route path="finances" element={<FinanceView />} />
        <Route path="events" element={<EventView />} />
        <Route path="goals" element={<GoalView />} />
        <Route path="health" element={<HealthView />} />
        <Route path="tasks" element={<TaskTableView />} />
      </Routes>
    </div>
  );
});
