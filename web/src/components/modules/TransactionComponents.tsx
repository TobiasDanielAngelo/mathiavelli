import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useStore } from "../../api/Store";
import {
  Transaction,
  TransactionFields,
  TransactionInterface,
} from "../../api/TransactionStore";
import { MyMultiDropdownSelector } from "../../blueprints";
import { KV } from "../../blueprints/ItemDetails";
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
  ActionModalDef,
  GraphType,
  MyGenericView,
} from "../../blueprints/MyGenericComponents/MyGenericView";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { toMoney, toOptions, toTitleCase } from "../../constants/helpers";
import { useLocalStorageState, useVisible } from "../../constants/hooks";
import { Field, PaginatedDetails } from "../../constants/interfaces";
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
      storeFns={{
        add: transactionStore.addItem,
        update: transactionStore.updateItem,
        delete: transactionStore.deleteItem,
      }}
      datetimeFields={TransactionFields.datetime}
      dateFields={TransactionFields.date}
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

    console.log(transactionAnalyticsStore.items.map((s) => s.total));

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
            excludedFromTotal={["Operations", "Initial"]}
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
        <MyGenericCollection
          CardComponent={TransactionCard}
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={transactionStore.items}
        />
      }
      SideB={<TransactionDashboard itemMap={itemMap} graph={graph} />}
      ratio={0.7}
    />
  );
});

export const TransactionFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new Transaction({}).$view}
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
  const {
    shownFields,
    params,
    setParams,
    pageDetails,
    PageBar,
    itemMap,
    sortFields,
    setSortFields,
  } = useTransactionView();

  return (
    <MyGenericTable
      items={transactionStore.items}
      shownFields={shownFields}
      sortFields={sortFields}
      setSortFields={setSortFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <TransactionRow item={item} />}
      priceFields={TransactionFields.prices}
      itemMap={itemMap}
    />
  );
});

export const TransactionView = observer(() => {
  const {
    transactionStore,
    accountStore,
    categoryStore,
    transactionAnalyticsStore,
  } = useStore();
  const { setVisible1, setVisible4, isVisible, setVisible } = useVisible();
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const [params, setParams] = useSearchParams();
  const objWithFields = new Transaction({}).$view;
  const [graph, setGraph] = useState<GraphType>("pie");
  const [shownFields, setShownFields] = useLocalStorageState(
    Object.keys(objWithFields) as (keyof TransactionInterface)[],
    "shownFieldsTransaction"
  );
  const [sortFields, setSortFields] = useLocalStorageState(
    [] as string[],
    "sortFieldsTransaction"
  );
  const fetchFcn = async () => {
    const resp = await transactionStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
    transactionAnalyticsStore.fetchAll(`graph=${graph}`);
  };

  const itemMap = useMemo(
    () =>
      [
        {
          key: "transmitter",
          values: accountStore.items,
          label: "name",
        },
        {
          key: "receiver",
          values: accountStore.items,
          label: "name",
        },
        {
          key: "account",
          values: accountStore.items,
          label: "name",
        },
        {
          key: "category",
          values: categoryStore.items,
          label: "title",
        },
      ] satisfies KV<any>[],
    [
      transactionStore.items.length,
      categoryStore.items.length,
      accountStore.items.length,
    ]
  );

  const actionModalDefs = [
    {
      icon: "NoteAdd",
      label: "NEW",
      name: "Add a Transaction",
      modal: <TransactionForm fetchFcn={fetchFcn} setVisible={setVisible1} />,
    },
    {
      icon: "ViewList",
      label: "FIELDS",
      name: "Show Fields",
      modal: (
        <MyMultiDropdownSelector
          label="Fields"
          value={shownFields}
          onChangeValue={(t) =>
            setShownFields(t as (keyof TransactionInterface)[])
          }
          options={Object.keys(objWithFields).map((s) => ({
            id: s,
            name: toTitleCase(s),
          }))}
          relative
          open
        />
      ),
    },
    {
      icon: "FilterListAlt",
      label: "FILTERS",
      name: "Filters",
      modal: <TransactionFilter />,
    },
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
      fetchFcn={fetchFcn}
      actionModalDefs={actionModalDefs}
      isVisible={isVisible}
      setVisible={setVisible}
      Context={TransactionViewContext}
      CollectionComponent={TransactionCollection}
      TableComponent={TransactionTable}
      shownFields={shownFields}
      setShownFields={setShownFields}
      sortFields={sortFields}
      setSortFields={setSortFields}
      availableGraphs={["pie", "line"]}
      pageDetails={pageDetails}
      params={params}
      setParams={setParams}
      itemMap={itemMap}
      graph={graph}
      setGraph={setGraph}
    />
  );
});
