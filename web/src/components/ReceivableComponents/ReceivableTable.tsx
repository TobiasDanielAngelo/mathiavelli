import { observer } from "mobx-react-lite";
import { useStore } from "../../api/Store";
import { MyDynamicTable } from "../../blueprints/MyDynamicTable";
import { useReceivableView } from "./ReceivableProps";
import { ReceivableRow } from "./ReceivableRow";

export const ReceivableTable = observer(() => {
  const { receivableStore } = useStore();
  const { shownFields, params, setParams, pageDetails, itemMap, PageBar } =
    useReceivableView();

  return (
    <MyDynamicTable
      items={receivableStore.items}
      priceFields={["lentAmount", "paymentTotal"]}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      itemMap={itemMap}
      renderActions={(item) => <ReceivableRow item={item} />}
    />
  );
});
