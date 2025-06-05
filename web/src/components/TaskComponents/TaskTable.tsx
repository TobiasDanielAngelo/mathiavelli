import { observer } from "mobx-react-lite";
import { useStore } from "../../api/Store";
import { MyDynamicTable } from "../../blueprints/MyDynamicTable";
import { useTaskView } from "./TaskProps";
import { TaskRow } from "./TaskRow";

export const TaskTable = observer(() => {
  const { taskStore } = useStore();
  const { shownFields, params, setParams, pageDetails, itemMap, PageBar } =
    useTaskView();

  return (
    <MyDynamicTable
      items={taskStore.items}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      itemMap={itemMap}
      renderActions={(item) => <TaskRow item={item} />}
    />
  );
});
