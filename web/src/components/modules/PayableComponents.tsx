import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import {
  Payable,
  PayableFields,
  PayableInterface,
} from "../../api/PayableStore";
import { useStore } from "../../api/Store";
import { KV, ActionModalDef } from "../../constants/interfaces";
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
import { Field } from "../../constants/interfaces";
import { AccountIdMap } from "./AccountComponents";
import { CategoryIdMap } from "./CategoryComponents";
import { TransactionForm } from "./TransactionComponents";

export const { Context: PayableViewContext, useGenericView: usePayableView } =
  createGenericViewContext<PayableInterface>();

const title = "Payables";

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
      store={payableStore}
      datetimeFields={PayableFields.datetimeFields}
      dateFields={PayableFields.dateFields}
      timeFields={PayableFields.timeFields}
    />
  );
};

export const PayableCard = observer((props: { item: Payable }) => {
  const { item } = props;
  const { fetchFcn, shownFields, itemMap } = usePayableView();
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
        prices={PayableFields.pricesFields}
        FormComponent={PayableForm}
        deleteItem={payableStore.deleteItem}
        fetchFcn={fetchFcn}
        moreActions={moreActions}
        itemMap={itemMap}
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
        <MyGenericCollection
          CardComponent={PayableCard}
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={payableStore.items}
        />
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
      dateFields={[
        ...PayableFields.dateFields,
        ...PayableFields.datetimeFields,
      ]}
      excludeFields={["id"]}
      relatedFields={[]}
      optionFields={[]}
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
  const values = usePayableView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={payableStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <PayableRow item={item} />}
      priceFields={PayableFields.pricesFields}
      {...values}
    />
  );
});

export const PayableView = observer(() => {
  const { payableStore, transactionStore, settingStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<PayableInterface, Payable>(
    settingStore,
    "Payable",
    new Payable({})
  );
  const { params, setPageDetails } = values;
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

  const actionModalDefs = [] satisfies ActionModalDef[];

  return (
    <MyGenericView<PayableInterface>
      title={title}
      Context={PayableViewContext}
      CollectionComponent={PayableCollection}
      FormComponent={PayableForm}
      FilterComponent={PayableFilter}
      actionModalDefs={actionModalDefs}
      TableComponent={PayableTable}
      fetchFcn={fetchFcn}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
