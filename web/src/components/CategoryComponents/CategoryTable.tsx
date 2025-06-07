import { observer } from "mobx-react-lite";
import { useStore } from "../../api/Store";
import { MyDynamicTable } from "../../blueprints/MyDynamicTable";
import { useCategoryView } from "./CategoryProps";
import { CategoryRow } from "./CategoryRow";

export const CategoryTable = observer(() => {
  const { categoryStore } = useStore();
  const { shownFields, params, setParams, pageDetails, PageBar } =
    useCategoryView();

  return (
    <MyDynamicTable
      items={categoryStore.items}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <CategoryRow item={item} />}
    />
  );
});
