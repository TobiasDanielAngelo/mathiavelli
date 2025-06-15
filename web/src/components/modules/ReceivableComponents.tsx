import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import {
  Receivable,
  ReceivableFields,
  ReceivableInterface,
} from "../../api/ReceivableStore";
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
import { SideBySideView } from "../../blueprints/SideBySideView";
import {
  generateShortId,
  sortAndFilterByIds,
  toOptions,
  toTitleCase,
} from "../../constants/helpers";
import { Field, PaginatedDetails } from "../../constants/interfaces";
import { useLocalStorageState, useVisible } from "../../constants/hooks";
import { MyModal } from "../../blueprints/MyModal";
import { CategoryIdMap } from "./CategoryComponents";
import { TransactionForm } from "./TransactionComponents";
import { AccountIdMap } from "./AccountComponents";
import { useSearchParams } from "react-router-dom";
import { KV } from "../../blueprints/ItemDetails";
import { MyMultiDropdownSelector } from "../../blueprints";
import {
  ActionModalDef,
  MyGenericView,
} from "../../blueprints/MyGenericComponents/MyGenericView";

export const {
  Context: ReceivableViewContext,
  useGenericView: useReceivableView,
} = createGenericViewContext<ReceivableInterface>();

export const ReceivableIdMap = {} as const;

export const ReceivableForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: Receivable;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { receivableStore, transactionStore } = useStore();

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
        [{ name: "borrowerName", label: "Borrower Name", type: "text" }],
        [{ name: "lentAmount", label: "Lent Amount", type: "number" }],
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
    <MyGenericForm<ReceivableInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="receivable"
      fields={fields}
      storeFns={{
        add: receivableStore.addItem,
        update: receivableStore.updateItem,
        delete: receivableStore.deleteItem,
      }}
      datetimeFields={ReceivableFields.datetime}
      dateFields={ReceivableFields.date}
    />
  );
};

export const ReceivableCard = observer((props: { item: Receivable }) => {
  const { item } = props;
  const { fetchFcn, shownFields } = useReceivableView();
  const { receivableStore } = useStore();
  const { isVisible1, setVisible1 } = useVisible();

  const moreActions = [
    { onClick: () => setVisible1(true), icon: "Payment" },
  ] satisfies IAction[];
  return (
    <>
      <MyModal isVisible={isVisible1} setVisible={setVisible1}>
        <TransactionForm
          item={{
            receivableId: item.id,
            description: `RCV${item.id}-${generateShortId()}`,
            transmitter: AccountIdMap.Operations,
            receiver: AccountIdMap.Wallet,
            category: CategoryIdMap["Receivable Payment"],
          }}
          fetchFcn={fetchFcn}
          setVisible={setVisible1}
        />
      </MyModal>
      <MyGenericCard
        item={item}
        shownFields={shownFields}
        header={["id", "datetimeDue"]}
        important={["lentAmount"]}
        body={[
          "borrowerName",
          "description",
          "datetimeOpened",
          "datetimeClosed",
          "paymentDescription",
          "paymentTotal",
        ]}
        prices={ReceivableFields.prices}
        FormComponent={ReceivableForm}
        deleteItem={receivableStore.deleteItem}
        fetchFcn={fetchFcn}
        moreActions={moreActions}
      />
    </>
  );
});

export const ReceivableDashboard = observer(() => {
  return <></>;
});

export const ReceivableCollection = observer(() => {
  const { receivableStore } = useStore();
  const { pageDetails, PageBar } = useReceivableView();

  return (
    <SideBySideView
      SideA={
        <div className="flex flex-col min-h-[85vh]">
          <PageBar />
          <div className="flex-1">
            {sortAndFilterByIds(
              receivableStore.items,
              pageDetails?.ids ?? [],
              (s) => s.id
            ).map((s) => (
              <ReceivableCard item={s} key={s.id} />
            ))}
          </div>
          <PageBar />
        </div>
      }
      SideB={<ReceivableDashboard />}
      ratio={0.7}
    />
  );
});

export const ReceivableFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new Receivable({}).$view}
      title="Receivable Filters"
      dateFields={[...ReceivableFields.date, ...ReceivableFields.datetime]}
      excludeFields={["id"]}
    />
  );
});

export const ReceivableRow = observer((props: { item: Receivable }) => {
  const { item } = props;
  const { fetchFcn } = useReceivableView();
  const { receivableStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={ReceivableForm}
      deleteItem={receivableStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const ReceivableTable = observer(() => {
  const { receivableStore } = useStore();
  const { shownFields, params, setParams, pageDetails, PageBar, itemMap } =
    useReceivableView();

  return (
    <MyGenericTable
      items={receivableStore.items}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <ReceivableRow item={item} />}
      priceFields={ReceivableFields.prices}
      itemMap={itemMap}
    />
  );
});

export const ReceivableView = observer(() => {
  const { receivableStore, transactionStore } = useStore();
  const { setVisible1, isVisible, setVisible } = useVisible();
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const [params, setParams] = useSearchParams();
  const objWithFields = new Receivable({}).$;
  const [shownFields, setShownFields] = useLocalStorageState(
    Object.keys(objWithFields) as (keyof ReceivableInterface)[],
    "shownFieldsReceivable"
  );
  const fetchFcn = async () => {
    const resp = await receivableStore.fetchAll(params.toString());
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
      name: "Add a Receivable",
      modal: <ReceivableForm fetchFcn={fetchFcn} setVisible={setVisible1} />,
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
            setShownFields(t as (keyof ReceivableInterface)[])
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
      modal: <ReceivableFilter />,
    },
  ] satisfies ActionModalDef[];

  return (
    <MyGenericView<ReceivableInterface>
      fetchFcn={fetchFcn}
      actionModalDefs={actionModalDefs}
      isVisible={isVisible}
      setVisible={setVisible}
      Context={ReceivableViewContext}
      CollectionComponent={ReceivableCollection}
      TableComponent={ReceivableTable}
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
