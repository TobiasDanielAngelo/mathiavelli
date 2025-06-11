import { observer } from "mobx-react-lite";
import { useStore } from "../../api/Store";
import { MyDynamicTable } from "../../blueprints/MyDynamicTable";
import { useJobView } from "./JobProps";
import { JobRow } from "./JobRow";

export const JobTable = observer(() => {
  const { jobStore } = useStore();
  const { shownFields, params, setParams, pageDetails, itemMap, PageBar } =
    useJobView();

  return (
    <MyDynamicTable
      items={jobStore.items}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      itemMap={itemMap}
      renderActions={(item) => <JobRow item={item} />}
    />
  );
});
