import { observer } from "mobx-react-lite";
import { useStore } from "../../api/Store";
import { MyDynamicTable } from "../../blueprints/MyDynamicTable";
import { useFollowUpView } from "./FollowUpProps";
import { FollowUpRow } from "./FollowUpRow";

export const FollowUpTable = observer(() => {
  const { followUpStore } = useStore();
  const { shownFields, params, setParams, pageDetails, itemMap, PageBar } =
    useFollowUpView();

  return (
    <MyDynamicTable
      items={followUpStore.items}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      itemMap={itemMap}
      renderActions={(item) => <FollowUpRow item={item} />}
    />
  );
});
