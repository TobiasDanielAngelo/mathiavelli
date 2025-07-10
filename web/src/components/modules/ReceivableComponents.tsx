import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import {
  Receivable,
  ReceivableFields,
  ReceivableInterface,
} from "../../api/ReceivableStore";
import { useStore } from "../../api/Store";
import { KV } from "../../blueprints/ItemDetails";
import {
  IAction,
  MyGenericCard,
} from "../../blueprints/MyGenericComponents/MyGenericCard";
import { MyGenericCollection } from "../../blueprints/MyGenericComponents/MyGenericCollection";
import { MyGenericFilter } from "../../blueprints/MyGenericComponents/MyGenericFilter";
import { MyGenericForm } from "../../blueprints/MyGenericComponents/MyGenericForm";
import { createGenericViewContext } from "../../blueprints/MyGenericComponents/MyGenericProps";
import { MyGenericRow } from "../../blueprints/MyGenericComponents/MyGenericRow";
import { MyGenericTable } from "../../blueprints/MyGenericComponents/MyGenericTable";
import {
  ActionModalDef,
  MyGenericView,
  useViewValues,
} from "../../blueprints/MyGenericComponents/MyGenericView";
import { MyModal } from "../../blueprints/MyModal";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { generateShortId, toOptions } from "../../constants/helpers";
import { useVisible } from "../../constants/hooks";
import { Field } from "../../constants/interfaces";
import { AccountIdMap } from "./AccountComponents";
import { CategoryIdMap } from "./CategoryComponents";
import { TransactionForm } from "./TransactionComponents";

export const {
  Context: ReceivableViewContext,
  useGenericView: useReceivableView,
} = createGenericViewContext<ReceivableInterface>();

const title = "Receivables";

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
      store={receivableStore}
      datetimeFields={ReceivableFields.datetimeFields}
      dateFields={ReceivableFields.dateFields}
      timeFields={ReceivableFields.timeFields}
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
        prices={ReceivableFields.pricesFields}
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
        <MyGenericCollection
          CardComponent={ReceivableCard}
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={receivableStore.items}
        />
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
      dateFields={[
        ...ReceivableFields.dateFields,
        ...ReceivableFields.datetimeFields,
      ]}
      excludeFields={["id"]}
      relatedFields={[]}
      optionFields={[]}
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
  const values = useReceivableView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={receivableStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <ReceivableRow item={item} />}
      priceFields={ReceivableFields.pricesFields}
      {...values}
    />
  );
});

export const ReceivableView = observer(() => {
  const { receivableStore, transactionStore, settingStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<ReceivableInterface, Receivable>(
    settingStore,
    "Receivable",
    new Receivable({})
  );
  const { params, setPageDetails } = values;
  const fetchFcn = async () => {
    const resp = await receivableStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  console.log(receivableStore.items.map((s) => s.paymentTotal));

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

  const actionModalDefs = [] satisfies ActionModalDef[];

  return (
    <MyGenericView<ReceivableInterface>
      title={title}
      Context={ReceivableViewContext}
      CollectionComponent={ReceivableCollection}
      FormComponent={ReceivableForm}
      FilterComponent={ReceivableFilter}
      actionModalDefs={actionModalDefs}
      TableComponent={ReceivableTable}
      fetchFcn={fetchFcn}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
