import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useStore } from "../../api/Store";
import { Transaction, TransactionInterface } from "../../api/TransactionStore";
import { KV } from "../../blueprints/ItemDetails";
import { MyIcon } from "../../blueprints/MyIcon";
import { MyModal } from "../../blueprints/MyModal";
import { MyMultiDropdownSelector } from "../../blueprints/MyMultiDropdownSelector";
import { MyPageBar } from "../../blueprints/MyPageBar";
import { MySpeedDial } from "../../blueprints/MySpeedDial";
import { toTitleCase } from "../../constants/helpers";
import { useLocalStorageState, useVisible } from "../../constants/hooks";
import { PaginatedDetails } from "../../constants/interfaces";
import { AccountForm } from "../AccountComponents/AccountComponents";
import {
  TransactionCollection,
  TransactionFilter,
  TransactionForm,
  TransactionTable,
  TransactionViewContext,
} from "./TransactionComponents";

export const TransactionView = observer(() => {
  const {
    transactionStore,
    categoryStore,
    accountStore,
    transactionAnalyticsStore,
  } = useStore();
  const [view, setView] = useState<"card" | "table">("card");
  const [graph, setGraph] = useState<"pie" | "line">("pie");
  const {
    isVisible1,
    setVisible1,
    isVisible2,
    setVisible2,
    isVisible3,
    setVisible3,
    isVisible4,
    setVisible4,
  } = useVisible();
  const [shownFields, setShownFields] = useLocalStorageState(
    Object.keys(new Transaction({}).$view) as (keyof TransactionInterface)[],
    "shownFieldsTransaction"
  );

  const [params, setParams] = useSearchParams();
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const queryString = new URLSearchParams(params).toString();

  const fetchTransactions = async () => {
    const resp = await transactionStore.fetchAll(queryString);
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
    transactionAnalyticsStore.fetchAll(`graph=${graph}`);
  };

  const toggleView = () => {
    setView((prev) => (prev === "card" ? "table" : "card"));
  };

  const toggleGraph = () => {
    setGraph((prev) => (prev === "line" ? "pie" : "line"));
  };

  const onClickPrev = () => {
    setParams((t) => {
      const newParams = new URLSearchParams(t);
      const currentPage = Number(newParams.get("page")) || 1;
      newParams.set("page", String(Math.max(currentPage - 1, 1)));
      return newParams;
    });
  };

  const onClickNext = () => {
    setParams((t) => {
      const newParams = new URLSearchParams(t);
      const currentPage = Number(newParams.get("page")) || 1;
      newParams.set(
        "page",
        String(
          Math.min(currentPage + 1, pageDetails?.totalPages ?? currentPage)
        )
      );
      return newParams;
    });
  };

  const onClickPage = (s: number) => {
    setParams((t) => {
      const newParams = new URLSearchParams(t);
      newParams.set("page", String(s));
      return newParams;
    });
  };

  const PageBar = () => (
    <MyPageBar
      pageDetails={pageDetails}
      onClickNext={onClickNext}
      onClickPrev={onClickPrev}
      onClickPage={onClickPage}
    />
  );

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
      ] as KV<any>[],
    [
      transactionStore.items.length,
      categoryStore.items.length,
      accountStore.items,
    ]
  );

  const actions = useMemo(
    () => [
      {
        icon: (
          <div className="flex flex-col items-center">
            <MyIcon icon="AddCard" fontSize="large" />
            <div className="text-xs text-gray-500 font-bold">TRX</div>
          </div>
        ),
        name: "Add a Transaction",
        onClick: () => setVisible1(true),
      },
      {
        icon: (
          <div className="flex flex-col items-center">
            <MyIcon icon="AddCard" fontSize="large" />
            <div className="text-xs text-gray-500 font-bold">FIELDS</div>
          </div>
        ),
        name: "Show Fields",
        onClick: () => setVisible2(true),
      },
      {
        icon: (
          <div className="flex flex-col items-center">
            <MyIcon icon="AddCard" fontSize="large" />
            <div className="text-xs text-gray-500 font-bold">FILTERS</div>
          </div>
        ),
        name: "Filters",
        onClick: () => setVisible3(true),
      },
      {
        icon: (
          <div className="flex flex-col items-center">
            <MyIcon icon="AddCard" fontSize="large" />
            <div className="text-xs text-gray-500 font-bold">ACCT</div>
          </div>
        ),
        name: "Add an Transaction",
        onClick: () => setVisible4(true),
      },
    ],
    []
  );

  const views = useMemo(
    () => [
      {
        icon: (
          <div className="flex flex-col items-center">
            {view === "card" ? "📊" : "🗂️"}
            <div className="text-xs text-gray-500 font-bold">
              {view === "card" ? "CARD" : "TABLE"}
            </div>
          </div>
        ),
        name: "Toggle View",
        onClick: toggleView,
      },
      {
        icon: (
          <div className="flex flex-col items-center text-3xl">
            {graph === "pie" ? `\u25d4` : "\u{1F4C8}"}
            <div className="text-xs text-gray-500 font-bold">
              {graph === "pie" ? `PIE` : "TREND"}
            </div>
          </div>
        ),
        name: "Toggle Graphs",
        onClick: toggleGraph,
      },
    ],
    [view, graph]
  );

  useEffect(() => {
    fetchTransactions();
  }, [params]);

  const value = {
    shownFields,
    setShownFields,
    params,
    setParams,
    pageDetails,
    itemMap,
    PageBar,
    graph,
    fetchFcn: fetchTransactions,
  };

  return (
    <TransactionViewContext.Provider value={value}>
      <div className="relative">
        <MySpeedDial actions={actions} />
        <MySpeedDial actions={views} leftSide />
        <MyModal isVisible={isVisible1} setVisible={setVisible1} disableClose>
          <TransactionForm
            setVisible={setVisible1}
            fetchFcn={fetchTransactions}
          />
        </MyModal>
        <MyModal isVisible={isVisible2} setVisible={setVisible2} disableClose>
          <MyMultiDropdownSelector
            label="Fields"
            value={shownFields}
            onChangeValue={(t) =>
              setShownFields(t as (keyof TransactionInterface)[])
            }
            options={Object.keys(new Transaction({}).$view).map((s) => ({
              id: s,
              name: toTitleCase(s),
            }))}
            relative
            open
          />
        </MyModal>
        <MyModal isVisible={isVisible3} setVisible={setVisible3} disableClose>
          <TransactionFilter />
        </MyModal>
        <MyModal isVisible={isVisible4} setVisible={setVisible4} disableClose>
          <AccountForm setVisible={setVisible4} />
        </MyModal>
        {view === "card" ? <TransactionCollection /> : <TransactionTable />}
      </div>
    </TransactionViewContext.Provider>
  );
});
