import { observer } from "mobx-react-lite";
import { useStore } from "../../api/Store";
import { MyDynamicTable } from "../../blueprints/MyDynamicTable";
import { usePayableView } from "./PayableProps";
import { PayableRow } from "./PayableRow";

export const PayableTable = observer(() => {
  const { payableStore } = useStore();
  const { shownFields, params, setParams, pageDetails, itemMap, PageBar } =
    usePayableView();

  return (
    <MyDynamicTable
      items={payableStore.items}
      priceFields={["borrowedAmount", "paymentTotal"]}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      itemMap={itemMap}
      renderActions={(item) => <PayableRow item={item} />}
    />
  );
});
