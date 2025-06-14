import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Payable, PayableInterface } from "../../api/PayableStore";
import { useStore } from "../../api/Store";
import { KV } from "../../blueprints/ItemDetails";
import { MyIcon } from "../../blueprints/MyIcon";
import { MyModal } from "../../blueprints/MyModal";
import { MyMultiDropdownSelector } from "../../blueprints/MyMultiDropdownSelector";
import { MyPageBar } from "../../blueprints/MyPageBar";
import { MySpeedDial } from "../../blueprints/MySpeedDial";
import { getUniqueIdsFromFK, toTitleCase } from "../../constants/helpers";
import { useLocalStorageState, useVisible } from "../../constants/hooks";
import { PaginatedDetails } from "../../constants/interfaces";
import {
  PayableCollection,
  PayableFilter,
  PayableForm,
  PayableTable,
  PayableViewContext,
} from "./PayableComponents";

export const PayableView = observer(() => {
  const { payableStore, transactionStore } = useStore();
  const [view, setView] = useState<"card" | "table">("card");
  const {
    isVisible1,
    setVisible1,
    isVisible2,
    setVisible2,
    isVisible3,
    setVisible3,
  } = useVisible();
  const [shownFields, setShownFields] = useLocalStorageState(
    Object.keys(new Payable({}).$view) as (keyof PayableInterface)[],
    "shownFieldsPayable"
  );

  const [params, setParams] = useSearchParams();
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const queryString = new URLSearchParams(params).toString();

  const fetchPayables = async () => {
    const resp = await payableStore.fetchAll(queryString);
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
    const payments = getUniqueIdsFromFK(resp.data, "payment").flat(1);
    if (payments.length)
      transactionStore.fetchAll(`id__in=${payments.join(",")}`);
  };

  const toggleView = () => {
    setView((prev) => (prev === "card" ? "table" : "card"));
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
          key: "payment",
          values: transactionStore.items,
          label: "description",
        },
      ] as KV<any>[],
    [transactionStore.items.length]
  );

  const actions = useMemo(
    () => [
      {
        icon: (
          <div className="flex flex-col items-center">
            <MyIcon icon="AddCard" fontSize="large" />
            <div className="text-xs text-gray-500 font-bold">ACPAY</div>
          </div>
        ),
        name: "Add a Payable",
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
    ],
    []
  );

  useEffect(() => {
    fetchPayables();
  }, [params]);

  const value = {
    shownFields,
    setShownFields,
    params,
    setParams,
    pageDetails,
    itemMap,
    PageBar,
    fetchFcn: fetchPayables,
  };

  return (
    <PayableViewContext.Provider value={value}>
      <div className="relative">
        <MySpeedDial actions={actions} />
        <MyModal isVisible={isVisible1} setVisible={setVisible1} disableClose>
          <PayableForm setVisible={setVisible1} fetchFcn={fetchPayables} />
        </MyModal>
        <MyModal isVisible={isVisible2} setVisible={setVisible2} disableClose>
          <MyMultiDropdownSelector
            label="Fields"
            value={shownFields}
            onChangeValue={(t) =>
              setShownFields(t as (keyof PayableInterface)[])
            }
            options={Object.keys(new Payable({}).$view).map((s) => ({
              id: s,
              name: toTitleCase(s),
            }))}
            relative
            open
          />
        </MyModal>
        <MyModal isVisible={isVisible3} setVisible={setVisible3} disableClose>
          <PayableFilter />
        </MyModal>
        {view === "card" ? <PayableCollection /> : <PayableTable />}
        <div
          className="fixed bottom-6 left-6 bg-blue-500 text-white rounded-full w-14 h-14 flex items-center justify-center cursor-pointer shadow-lg hover:bg-blue-600 transition-colors"
          onClick={toggleView}
          title="Toggle View"
        >
          {view === "card" ? "📊" : "🗂️"}
        </div>
      </div>
    </PayableViewContext.Provider>
  );
});
