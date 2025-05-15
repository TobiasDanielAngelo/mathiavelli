import "./App.css";
import { createStore, StoreContext } from "./api/Store";
import { JournalView } from "./components/JournalView";

function App() {
  const store = createStore();

  return (
    <StoreContext.Provider value={store}>
      <JournalView />
    </StoreContext.Provider>
  );
}

export default App;
