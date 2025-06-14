import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";
import { useStore } from "../../api/Store";
import {
  Transaction,
  TransactionFields,
  TransactionInterface,
} from "../../api/TransactionStore";
import { KV } from "../../blueprints/ItemDetails";
import { MyLineChart } from "../../blueprints/MyCharts/MyLineChart";
import { MyPieChart } from "../../blueprints/MyCharts/MyPieChart";
import { MyGenericCard } from "../../blueprints/MyGenericComponents/MyGenericCard";
import { MyGenericFilter } from "../../blueprints/MyGenericComponents/MyGenericFilter";
import { MyGenericForm } from "../../blueprints/MyGenericComponents/MyGenericForm";
import { createGenericViewContext } from "../../blueprints/MyGenericComponents/MyGenericProps";
import { MyGenericRow } from "../../blueprints/MyGenericComponents/MyGenericRow";
import { MyGenericTable } from "../../blueprints/MyGenericComponents/MyGenericTable";
import { SideBySideView } from "../../blueprints/SideBySideView";
import {
  sortAndFilterByIds,
  toMoney,
  toOptions,
} from "../../constants/helpers";
import { Field } from "../../constants/interfaces";

export const {
  Context: TransactionViewContext,
  useGenericView: useTransactionView,
} = createGenericViewContext<TransactionInterface>();

export const TransactionIdMap = {} as const;

export const TransactionForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: Partial<Transaction>;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { transactionStore, accountStore, categoryStore } = useStore();

  const fields = useMemo(
    () =>
      [
        [
          {
            name: "category",
            label: "Category",
            type: "select",
            options: toOptions(categoryStore.items, "title"),
          },
          {
            name: "amount",
            label: "Amount",
            type: "number",
          },
        ],
        [
          {
            name: "description",
            label: "Description",
            type: "text",
          },
        ],
        [
          {
            name: "transmitter",
            label: "From...",
            type: "select",
            options: toOptions(accountStore.items, "name"),
          },
          {
            name: "receiver",
            label: "To...",
            type: "select",
            options: toOptions(accountStore.items, "name"),
          },
        ],
        [
          {
            name: "datetimeTransacted",
            label: "Transact Date",
            type: "datetime",
          },
        ],
      ] satisfies Field[][],
    [accountStore.items.length, categoryStore.items.length]
  );

  return (
    <MyGenericForm<TransactionInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="transaction"
      fields={fields}
      storeFns={{
        add: transactionStore.addItem,
        update: transactionStore.updateItem,
        delete: transactionStore.deleteItem,
      }}
      datetimeFields={TransactionFields.datetime}
    />
  );
};

export const TransactionCard = observer((props: { item: Transaction }) => {
  const { item } = props;
  const { fetchFcn, shownFields } = useTransactionView();
  const { transactionStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id", "datetimeTransacted"]}
      important={["amount"]}
      body={["categoryTitle", "transmitterName", "receiverName", "description"]}
      prices={TransactionFields.prices}
      FormComponent={TransactionForm}
      deleteItem={transactionStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const TransactionDashboard = observer(
  (props: { itemMap?: KV<any>[]; graph?: string }) => {
    const { transactionAnalyticsStore } = useStore();
    const { itemMap, graph } = props;

    const fetchTransactionAnalytics = async () => {
      const resp = await transactionAnalyticsStore.fetchAll(`graph=${graph}`);
      if (!resp.ok || !resp.data) {
        return;
      }
    };

    useEffect(() => {
      fetchTransactionAnalytics();
    }, [graph]);

    return (
      <>
        {graph === "pie" ? (
          <MyPieChart
            data={transactionAnalyticsStore.items}
            nameKey="category"
            dataKey="total"
            itemMap={itemMap}
            formatter={(value: number, name: string) => [toMoney(value), name]}
          />
        ) : (
          <MyLineChart
            data={transactionAnalyticsStore.items}
            traceKey="account"
            xKey="period"
            yKey="total"
            formatter={(value: number, name: string) => [toMoney(value), name]}
            itemMap={itemMap}
            excludedFromTotal={["Operations"]}
            selectionLabel="Accounts"
          />
        )}
      </>
    );
  }
);

export const TransactionCollection = observer(() => {
  const { transactionStore } = useStore();
  const { pageDetails, PageBar, itemMap, graph } = useTransactionView();

  return (
    <SideBySideView
      SideA={
        <div className="flex flex-col min-h-[85vh]">
          <PageBar />
          <div className="flex-1">
            {sortAndFilterByIds(
              transactionStore.items,
              pageDetails?.ids ?? [],
              (s) => s.id
            ).map((s) => (
              <TransactionCard item={s} key={s.id} />
            ))}
          </div>
          <PageBar />
        </div>
      }
      SideB={<TransactionDashboard itemMap={itemMap} graph={graph} />}
      ratio={0.7}
    />
  );
});

export const TransactionFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new Transaction({}).$}
      title="Transaction Filters"
      dateFields={TransactionFields.datetime}
      excludeFields={["id"]}
    />
  );
});

export const TransactionRow = observer((props: { item: Transaction }) => {
  const { item } = props;
  const { fetchFcn } = useTransactionView();
  const { transactionStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={TransactionForm}
      deleteItem={transactionStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const TransactionTable = observer(() => {
  const { transactionStore } = useStore();
  const { shownFields, params, setParams, pageDetails, PageBar } =
    useTransactionView();

  return (
    <MyGenericTable
      items={transactionStore.items}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <TransactionRow item={item} />}
      priceFields={TransactionFields.prices}
    />
  );
});
