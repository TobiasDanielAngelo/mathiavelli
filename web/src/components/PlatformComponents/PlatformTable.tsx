import { observer } from "mobx-react-lite";
import { useStore } from "../../api/Store";
import { MyDynamicTable } from "../../blueprints/MyDynamicTable";
import { usePlatformView } from "./PlatformProps";
import { PlatformRow } from "./PlatformRow";

export const PlatformTable = observer(() => {
  const { platformStore } = useStore();
  const { shownFields, params, setParams, pageDetails, PageBar } =
    usePlatformView();

  return (
    <MyDynamicTable
      items={platformStore.items}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <PlatformRow item={item} />}
    />
  );
});
