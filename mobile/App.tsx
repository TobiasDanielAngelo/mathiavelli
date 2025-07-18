import { Button, StyleSheet, Text, View } from "react-native";
import { NativeRouter, Route, Routes, useNavigate } from "react-router-native";
import { LoginView } from "./src/components/main/LoginView";
import { createStore, StoreContext, useStore } from "./src/api/Store";

const Main = () => {
  const navigate = useNavigate();
  return (
    <View>
      <Text>Main</Text>
      <Button
        title="Press to Login"
        onPress={() => navigate("/login")}
      ></Button>
    </View>
  );
};

export default function App() {
  const store = createStore();
  return (
    <StoreContext.Provider value={store}>
      <NativeRouter>
        <Routes>
          <Route path="/*" element={<Main />} />
          <Route path="/login" element={<LoginView />} />
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
