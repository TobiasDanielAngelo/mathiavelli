import { BrowserRouter, Route, Routes } from "react-router-dom";
import { createStore, StoreContext } from "./api/Store";
import { LoginView } from "./components/main/LoginView";
import { MainView } from "./components/main/MainView";
import "./App.css";

function App() {
  const store = createStore();

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
