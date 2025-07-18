import { StyleSheet } from "react-native";
import { NativeRouter, Route, Routes } from "react-router-native";
import { createStore, StoreContext } from "./src/api/Store";
import { LoginView } from "./src/components/main/LoginView";
import { MainView } from "./src/components/main/MainView";
import { TestingView } from "./src/components/main/TestingView";

export default function App() {
  const store = createStore();
  return (
    <StoreContext.Provider value={store}>
      <NativeRouter>
        <Routes>
          <Route path="/*" element={<MainView />} />
          <Route path="/login" element={<LoginView />} />
          <Route path="/testing" element={<TestingView />} />
        </Routes>
      </NativeRouter>
    </StoreContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
