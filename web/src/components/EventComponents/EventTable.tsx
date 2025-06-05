import { observer } from "mobx-react-lite";
import { useStore } from "../../api/Store";
import { MyDynamicTable } from "../../blueprints/MyDynamicTable";
import { useEventView } from "./EventProps";
import { EventRow } from "./EventRow";

export const EventTable = observer(() => {
  const { eventStore } = useStore();
  const { shownFields, params, setParams, pageDetails, itemMap, PageBar } =
    useEventView();

  return (
    <MyDynamicTable
      items={eventStore.items}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      itemMap={itemMap}
      renderActions={(item) => <EventRow item={item} />}
    />
  );
});
