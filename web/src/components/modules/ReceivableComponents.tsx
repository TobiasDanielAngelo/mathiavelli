import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { Receivable, ReceivableInterface } from "../../api/ReceivableStore";
import { useStore } from "../../api/Store";
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
  MyGenericView,
  useViewValues,
} from "../../blueprints/MyGenericComponents/MyGenericView";
import { MyModal } from "../../blueprints/MyModal";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { generateShortId, toOptions } from "../../constants/helpers";
import { useVisible } from "../../constants/hooks";
import { ActionModalDef, Field, KV } from "../../constants/interfaces";
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
      datetimeFields={receivableStore.datetimeFields}
      dateFields={receivableStore.dateFields}
      timeFields={receivableStore.timeFields}
    />
  );
};

export const ReceivableCard = observer((props: { item: Receivable }) => {
  const { item } = props;
  const { fetchFcn, shownFields, itemMap, related } = useReceivableView();
  const { receivableStore } = useStore();
  const { isVisible1, setVisible1, isVisible2, setVisible2 } = useVisible();

  const moreActions = (
    item.chargeTransaction
      ? [{ onClick: () => setVisible1(true), icon: "Payment" }]
      : [
          { onClick: () => setVisible1(true), icon: "Payment" },
          { onClick: () => setVisible2(true), icon: "ElectricBolt" },
        ]
  ) satisfies IAction[];
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
      <MyModal isVisible={isVisible2} setVisible={setVisible2}>
        <TransactionForm
          item={{
            receivableId: item.id,
            description: `Charge TRX for RCV${item.id}`,
            amount: item.lentAmount,
            receiver: AccountIdMap.Operations,
            category: CategoryIdMap["Lend Money"],
            datetimeTransacted: item.datetimeOpened,
          }}
          fetchFcn={fetchFcn}
          setVisible={setVisible2}
        />
      </MyModal>
      <MyGenericCard
        item={item}
        shownFields={shownFields}
        header={["id", "datetimeDue"]}
        important={["lentAmount"]}
        prices={receivableStore.priceFields}
        FormComponent={ReceivableForm}
        deleteItem={receivableStore.deleteItem}
        fetchFcn={fetchFcn}
        moreActions={moreActions}
        itemMap={itemMap}
        related={related}
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
  const { receivableStore } = useStore();
  return (
    <MyGenericFilter
      view={new Receivable({}).$view}
      title="Receivable Filters"
      dateFields={[
        ...receivableStore.dateFields,
        ...receivableStore.datetimeFields,
      ]}
      relatedFields={receivableStore.relatedFields}
      optionFields={receivableStore.optionFields}
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
      priceFields={receivableStore.priceFields}
      {...values}
    />
  );
});

export const ReceivableView = observer(() => {
  const { receivableStore, settingStore } = useStore();
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

  const itemMap = useMemo(() => [] as KV<any>[], []);

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
      related={receivableStore.related}
      fetchFcn={fetchFcn}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
