import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { ResponsiveDrawer } from "../blueprints/MyDrawer";
import { useStore } from "../api/Store";
import { NavBar } from "../blueprints/MainParts";
import { JournalView } from "./JournalView";
import { FinanceView } from "./FinanceView";

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
    }
  };

  useEffect(() => {
    reauthUser();
    return () => {
      setOpen(false);
    };
  }, []);

  return (
    <div>
      <ResponsiveDrawer open={open} setOpen={setOpen} />
      <NavBar setOpen={setOpen} />
      <Routes>
        <Route path="" element={<FinanceView />} />
        <Route path="journals" element={<JournalView />} />
        <Route path="finances" element={<FinanceView />} />
      </Routes>
    </div>
  );
});
