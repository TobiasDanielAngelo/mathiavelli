import { BrowserRouter, Route, Routes } from "react-router-dom";
import { createStore, StoreContext } from "./api/Store";
import "./App.css";
import { LoginView } from "./components/main/LoginView";
import { MainView } from "./components/main/MainView";
import { AppReleases } from "./components/main/AppReleases";

function App() {
  const store = createStore();

  return (
    <div>
      <StoreContext.Provider value={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/*" element={<MainView />} />
            <Route path="/login" element={<LoginView />} />
            <Route path="/app-releases" element={<AppReleases />} />
          </Routes>
        </BrowserRouter>
      </StoreContext.Provider>
    </div>
  );
}

export default App;
