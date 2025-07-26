import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { Related } from "../../api";
import { CATEGORY_CHOICES } from "../../api/CategoryStore";
import { useStore } from "../../api/Store";
import { Transaction, TransactionInterface } from "../../api/TransactionStore";
import { MyLineChart } from "../../blueprints/MyCharts/MyLineChart";
import { MyPieChart } from "../../blueprints/MyCharts/MyPieChart";
import { MyGenericCard } from "../../blueprints/MyGenericComponents/MyGenericCard";
import { MyGenericCollection } from "../../blueprints/MyGenericComponents/MyGenericCollection";
import { MyGenericFilter } from "../../blueprints/MyGenericComponents/MyGenericFilter";
import { MyGenericForm } from "../../blueprints/MyGenericComponents/MyGenericForm";
import { createGenericViewContext } from "../../blueprints/MyGenericComponents/MyGenericProps";
import { MyGenericRow } from "../../blueprints/MyGenericComponents/MyGenericRow";
import { MyGenericTable } from "../../blueprints/MyGenericComponents/MyGenericTable";
import {
  MyGenericView,
  useViewValues,
} from "../../blueprints/MyGenericComponents/MyGenericView";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { toMoneyShortened, toOptions } from "../../constants/helpers";
import { useVisible } from "../../constants/hooks";
import { ActionModalDef, Field, KV } from "../../constants/interfaces";
import { AccountForm } from "./AccountComponents";

export const {
  Context: TransactionViewContext,
  useGenericView: useTransactionView,
} = createGenericViewContext<TransactionInterface>();

const title = "Transactions";

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
      store={transactionStore}
      datetimeFields={transactionStore.datetimeFields}
      dateFields={transactionStore.dateFields}
      timeFields={transactionStore.timeFields}
    />
  );
};

export const TransactionCard = observer((props: { item: Transaction }) => {
  const { item } = props;
  const { fetchFcn, shownFields, itemMap, related } = useTransactionView();
  const { transactionStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id", "datetimeTransacted"]}
      important={["amount"]}
      prices={transactionStore.priceFields}
      FormComponent={TransactionForm}
      deleteItem={transactionStore.deleteItem}
      fetchFcn={fetchFcn}
      itemMap={itemMap}
      related={related}
    />
  );
});

export const TransactionDashboard = observer(
  (props: { related: Related[]; itemMap?: KV<any>[]; graph?: string }) => {
    const { transactionAnalyticsStore } = useStore();
    const { related, itemMap, graph } = props;

    return (
      <>
        {graph === "pie" ? (
          <MyPieChart
            data={transactionAnalyticsStore.items.filter(
              (s) => s.graph === "pie"
            )}
            nameKey="category"
            dataKey="total"
            traceKey="categoryNature"
            itemMap={itemMap}
            related={related}
            formatter={(value: number, name: string) => [
              toMoneyShortened(value),
              name,
            ]}
            title="Transactions"
          />
        ) : (
          <MyLineChart
            data={transactionAnalyticsStore.items.filter(
              (s) => s.graph === "line"
            )}
            traceKey="account"
            xKey="period"
            yKey="total"
            formatter={(value: number, name: string) => [
              toMoneyShortened(value),
              name,
            ]}
            related={related}
            itemMap={itemMap}
            excludedFromTotal={["Operations", "Initial"]}
            selectionLabel="Accounts"
            title="Transactions"
          />
        )}
      </>
    );
  }
);

export const TransactionCollection = observer(() => {
  const { transactionStore } = useStore();
  const { pageDetails, PageBar, itemMap, graph, related } =
    useTransactionView();

  return (
    <SideBySideView
      SideA={
        <MyGenericCollection
          CardComponent={TransactionCard}
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={transactionStore.items}
        />
      }
      SideB={
        <TransactionDashboard
          itemMap={itemMap}
          graph={graph}
          related={related}
        />
      }
      ratio={0.7}
    />
  );
});

export const TransactionFilter = observer(() => {
  const { transactionStore } = useStore();
  return (
    <MyGenericFilter
      view={new Transaction({}).$view}
      title="Transaction Filters"
      dateFields={[
        ...transactionStore.datetimeFields,
        ...transactionStore.dateFields,
      ]}
      relatedFields={transactionStore.relatedFields}
      optionFields={transactionStore.optionFields}
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
  const values = useTransactionView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={transactionStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <TransactionRow item={item} />}
      priceFields={transactionStore.priceFields}
      {...values}
    />
  );
});

export const TransactionView = observer(() => {
  const {
    transactionStore,
    transactionAnalyticsStore,
    settingStore,
    accountStore,
  } = useStore();
  const { setVisible4, isVisible, setVisible } = useVisible();
  const values = useViewValues<TransactionInterface, Transaction>(
    settingStore,
    "Transaction",
    new Transaction({})
  );
  const { params, setPageDetails } = values;
  const fetchFcn = async () => {
    const resp = await transactionStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
    transactionAnalyticsStore.fetchAll();
  };

  const itemMap = useMemo(
    () =>
      [
        {
          key: "account",
          values: accountStore.items,
          label: "name",
        },
        {
          key: "categoryNature",
          values: CATEGORY_CHOICES,
          label: "",
        },
      ] satisfies KV<any>[],
    [accountStore.items.length]
  );

  const actionModalDefs = [
    {
      icon: "NoteAdd",
      label: "ACCT",
      name: "Add an Account",
      modal: <AccountForm setVisible={setVisible4} />,
    },
  ] satisfies ActionModalDef[];

  return (
    <MyGenericView<TransactionInterface>
      title={title}
      Context={TransactionViewContext}
      CollectionComponent={TransactionCollection}
      FormComponent={TransactionForm}
      FilterComponent={TransactionFilter}
      actionModalDefs={actionModalDefs}
      TableComponent={TransactionTable}
      related={transactionStore.related}
      fetchFcn={fetchFcn}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
