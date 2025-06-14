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

  const fetchFcn = async () => {
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
      accountStore.items.length,
    ]
  );

  const actions = useMemo(
    () => [
      {
        icon: <MyIcon icon="NoteAdd" fontSize="large" label="TRX" />,
        name: "Add a Transaction",
        onClick: () => setVisible1(true),
      },
      {
        icon: <MyIcon icon="ViewList" fontSize="large" label="FIELDS" />,
        name: "Show Fields",
        onClick: () => setVisible2(true),
      },
      {
        icon: <MyIcon icon="FilterListAlt" fontSize="large" label="FILTERS" />,
        name: "Filters",
        onClick: () => setVisible3(true),
      },
      {
        icon: <MyIcon icon="NoteAdd" fontSize="large" label="ACCT" />,
        name: "Add an Transaction",
        onClick: () => setVisible4(true),
      },
    ],
    []
  );

  const views = useMemo(
    () => [
      {
        icon:
          view === "card" ? (
            <MyIcon icon="Padding" label="CARD" />
          ) : (
            <MyIcon icon="TableChart" label="TABLE" />
          ),
        name: "Toggle View",
        onClick: toggleView,
      },
      {
        icon:
          graph === "pie" ? (
            <MyIcon icon="PieChart" label="PIE" />
          ) : (
            <MyIcon icon="Timeline" label="TREND" />
          ),
        name: "Toggle Graphs",
        onClick: toggleGraph,
      },
    ],
    [view, graph]
  );

  useEffect(() => {
    fetchFcn();
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
    fetchFcn: fetchFcn,
  };

  return (
    <TransactionViewContext.Provider value={value}>
      <div className="relative">
        <MySpeedDial actions={actions} />
        <MySpeedDial actions={views} leftSide />
        <MyModal isVisible={isVisible1} setVisible={setVisible1} disableClose>
          <TransactionForm setVisible={setVisible1} fetchFcn={fetchFcn} />
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
