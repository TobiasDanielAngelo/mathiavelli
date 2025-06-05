import { observer } from "mobx-react-lite";
import { useStore } from "../../api/Store";
import { MyDynamicTable } from "../../blueprints/MyDynamicTable";
import { useTagView } from "./TagProps";
import { TagRow } from "./TagRow";

export const TagTable = observer(() => {
  const { tagStore } = useStore();
  const { shownFields, params, setParams, pageDetails, PageBar } = useTagView();

  return (
    <MyDynamicTable
      items={tagStore.items}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <TagRow item={item} />}
    />
  );
});
