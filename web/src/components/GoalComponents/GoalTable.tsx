import { observer } from "mobx-react-lite";
import { useStore } from "../../api/Store";
import { MyDynamicTable } from "../../blueprints/MyDynamicTable";
import { useGoalView } from "./GoalProps";
import { GoalRow } from "./GoalRow";

export const GoalTable = observer(() => {
  const { goalStore } = useStore();
  const { shownFields, params, setParams, pageDetails, itemMap, PageBar } =
    useGoalView();

  return (
    <MyDynamicTable
      items={goalStore.items}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      itemMap={itemMap}
      renderActions={(item) => <GoalRow item={item} />}
    />
  );
});
