import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import {
  Payable,
  PayableFields,
  PayableInterface,
} from "../../api/PayableStore";
import { useStore } from "../../api/Store";
import {
  IAction,
  MyGenericCard,
} from "../../blueprints/MyGenericComponents/MyGenericCard";
import { MyGenericFilter } from "../../blueprints/MyGenericComponents/MyGenericFilter";
import { MyGenericForm } from "../../blueprints/MyGenericComponents/MyGenericForm";
import { createGenericViewContext } from "../../blueprints/MyGenericComponents/MyGenericProps";
import { MyGenericRow } from "../../blueprints/MyGenericComponents/MyGenericRow";
import { MyGenericTable } from "../../blueprints/MyGenericComponents/MyGenericTable";
import { MyModal } from "../../blueprints/MyModal";
import { SideBySideView } from "../../blueprints/SideBySideView";
import {
  generateShortId,
  sortAndFilterByIds,
  toOptions,
  toTitleCase,
} from "../../constants/helpers";
import { useLocalStorageState, useVisible } from "../../constants/hooks";
import { Field, PaginatedDetails } from "../../constants/interfaces";
import { AccountIdMap } from "./AccountComponents";
import { CategoryIdMap } from "./CategoryComponents";
import { TransactionForm } from "./TransactionComponents";
import { useSearchParams } from "react-router-dom";
import { KV } from "../../blueprints/ItemDetails";
import { MyMultiDropdownSelector } from "../../blueprints";
import {
  ActionModalDef,
  MyGenericView,
} from "../../blueprints/MyGenericComponents/MyGenericView";

export const { Context: PayableViewContext, useGenericView: usePayableView } =
  createGenericViewContext<PayableInterface>();

export const PayableIdMap = {} as const;

export const PayableForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: Payable;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { payableStore, transactionStore } = useStore();

  const fields = useMemo(
    () =>
      [
        [
          {
            name: "payment",
            label: "Payment",
            type: "multi",
            options: toOptions(transactionStore.items, "description"),
          },
        ],
        [{ name: "lenderName", label: "Lender Name", type: "text" }],
        [{ name: "borrowedAmount", label: "Borrowed Amount", type: "number" }],
        [{ name: "description", label: "Description", type: "text" }],
        [
          {
            name: "datetimeOpened",
            label: "Datetime Opened",
            type: "datetime",
          },
        ],
        [{ name: "datetimeDue", label: "Datetime Due", type: "datetime" }],
        [
          {
            name: "datetimeClosed",
            label: "Datetime Closed",
            type: "datetime",
          },
        ],
        [{ name: "isActive", label: "Is Active", type: "check" }],
      ] satisfies Field[][],
    [transactionStore.items.length]
  );

  return (
    <MyGenericForm<PayableInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="payable"
      fields={fields}
      storeFns={{
        add: payableStore.addItem,
        update: payableStore.updateItem,
        delete: payableStore.deleteItem,
      }}
      datetimeFields={PayableFields.datetime}
      dateFields={PayableFields.date}
    />
  );
};

export const PayableCard = observer((props: { item: Payable }) => {
  const { item } = props;
  const { fetchFcn, shownFields } = usePayableView();
  const { payableStore } = useStore();
  const { isVisible1, setVisible1 } = useVisible();

  const moreActions = [
    { onClick: () => setVisible1(true), icon: "Payment" },
  ] satisfies IAction[];

  return (
    <>
      <MyModal isVisible={isVisible1} setVisible={setVisible1}>
        <TransactionForm
          item={{
            payableId: item.id,
            description: `PAY${item.id}-${generateShortId()}`,
            transmitter: AccountIdMap.Wallet,
            receiver: AccountIdMap.Operations,
            category: CategoryIdMap["Payable Payment"],
          }}
          fetchFcn={fetchFcn}
          setVisible={setVisible1}
        />
      </MyModal>
      <MyGenericCard
        item={item}
        shownFields={shownFields}
        header={["id", "datetimeDue"]}
        important={["borrowedAmount"]}
        body={[
          "lenderName",
          "description",
          "datetimeOpened",
          "datetimeClosed",
          "paymentDescription",
          "paymentTotal",
        ]}
        prices={PayableFields.prices}
        FormComponent={PayableForm}
        deleteItem={payableStore.deleteItem}
        fetchFcn={fetchFcn}
        moreActions={moreActions}
      />
    </>
  );
});

export const PayableDashboard = observer(() => {
  return <></>;
});

export const PayableCollection = observer(() => {
  const { payableStore } = useStore();
  const { pageDetails, PageBar } = usePayableView();

  return (
    <SideBySideView
      SideA={
        <div className="flex flex-col min-h-[85vh]">
          <PageBar />
          <div className="flex-1">
            {sortAndFilterByIds(
              payableStore.items,
              pageDetails?.ids ?? [],
              (s) => s.id
            ).map((s) => (
              <PayableCard item={s} key={s.id} />
            ))}
          </div>
          <PageBar />
        </div>
      }
      SideB={<PayableDashboard />}
      ratio={0.7}
    />
  );
});

export const PayableFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new Payable({}).$view}
      title="Payable Filters"
      dateFields={[...PayableFields.date, ...PayableFields.datetime]}
      excludeFields={["id"]}
    />
  );
});

export const PayableRow = observer((props: { item: Payable }) => {
  const { item } = props;
  const { fetchFcn } = usePayableView();
  const { payableStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={PayableForm}
      deleteItem={payableStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const PayableTable = observer(() => {
  const { payableStore } = useStore();
  const { shownFields, params, setParams, pageDetails, PageBar, itemMap } =
    usePayableView();

  return (
    <MyGenericTable
      items={payableStore.items}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <PayableRow item={item} />}
      priceFields={PayableFields.prices}
      itemMap={itemMap}
    />
  );
});

export const PayableView = observer(() => {
  const { payableStore, transactionStore } = useStore();
  const { setVisible1, isVisible, setVisible } = useVisible();
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const [params, setParams] = useSearchParams();
  const objWithFields = new Payable({}).$;
  const [shownFields, setShownFields] = useLocalStorageState(
    Object.keys(objWithFields) as (keyof PayableInterface)[],
    "shownFieldsPayable"
  );
  const fetchFcn = async () => {
    const resp = await payableStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

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

  const actionModalDefs = [
    {
      icon: "NoteAdd",
      label: "NEW",
      name: "Add a Payable",
      modal: <PayableForm fetchFcn={fetchFcn} setVisible={setVisible1} />,
    },
    {
      icon: "ViewList",
      label: "FIELDS",
      name: "Show Fields",
      modal: (
        <MyMultiDropdownSelector
          label="Fields"
          value={shownFields}
          onChangeValue={(t) => setShownFields(t as (keyof PayableInterface)[])}
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
      modal: <PayableFilter />,
    },
  ] satisfies ActionModalDef[];

  return (
    <MyGenericView<PayableInterface>
      fetchFcn={fetchFcn}
      actionModalDefs={actionModalDefs}
      isVisible={isVisible}
      setVisible={setVisible}
      Context={PayableViewContext}
      CollectionComponent={PayableCollection}
      TableComponent={PayableTable}
      shownFields={shownFields}
      setShownFields={setShownFields}
      availableGraphs={["pie", "line"]}
      pageDetails={pageDetails}
      params={params}
      setParams={setParams}
      itemMap={itemMap}
    />
  );
});
