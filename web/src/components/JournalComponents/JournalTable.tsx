import { observer } from "mobx-react-lite";
import { useStore } from "../../api/Store";
import { MyDynamicTable } from "../../blueprints/MyDynamicTable";
import { useJournalView } from "./JournalProps";
import { JournalRow } from "./JournalRow";

export const JournalTable = observer(() => {
  const { journalStore } = useStore();
  const { shownFields, params, setParams, pageDetails, PageBar } =
    useJournalView();

  return (
    <MyDynamicTable
      items={journalStore.items}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <JournalRow item={item} />}
    />
  );
});
