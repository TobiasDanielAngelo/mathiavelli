import { BrowserRouter, Route, Routes } from "react-router-dom";
import { createStore, StoreContext } from "./api/Store";
import { LoginView } from "./components/main/LoginView";
import { MainView } from "./components/main/MainView";
import "./App.css";
import { useEffect } from "react";

function App() {
  const store = createStore();

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("Hello!", {
            body: "This is a local push notification.",
            // icon: "/icon.png", // optional
          });
        }
      });
    }
  }, []);
  return (
    <StoreContext.Provider value={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<MainView />} />
          <Route path="/login" element={<LoginView />} />
        </Routes>
      </BrowserRouter>
    </StoreContext.Provider>
  );
}

export default App;
