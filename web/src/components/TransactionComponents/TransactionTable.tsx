import { observer } from "mobx-react-lite";
import { useStore } from "../../api/Store";
import { MyDynamicTable } from "../../blueprints/MyDynamicTable";
import { useTransactionView } from "./TransactionProps";
import { TransactionRow } from "./TransactionRow";

export const TransactionTable = observer(() => {
  const { transactionStore } = useStore();
  const { shownFields, params, setParams, pageDetails, itemMap, PageBar } =
    useTransactionView();

  return (
    <MyDynamicTable
      items={transactionStore.items}
      priceFields={["amount"]}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      itemMap={itemMap}
      renderActions={(item) => <TransactionRow item={item} />}
    />
  );
});
