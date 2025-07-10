import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import {
  Account,
  AccountFields,
  AccountInterface,
} from "../../api/AccountStore";
import { useStore } from "../../api/Store";
import { KV } from "../../blueprints/ItemDetails";
import { MyGenericCard } from "../../blueprints/MyGenericComponents/MyGenericCard";
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
import { SideBySideView } from "../../blueprints/SideBySideView";
import { useVisible } from "../../constants/hooks";
import { Field } from "../../constants/interfaces";

export const { Context: AccountViewContext, useGenericView: useAccountView } =
  createGenericViewContext<AccountInterface>();

const title = "Accounts";

export const AccountIdMap = {
  Wallet: 1000001,
  Coins: 1000002,
  Operations: 1000003,
  Initial: 1000004,
} as const;

export const AccountForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: Account;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { accountStore } = useStore();

  const fields: Field[][] = [
    [
      {
        name: "name",
        label: "Account Name",
        type: "text",
      },
    ],
  ];

  return (
    <MyGenericForm<AccountInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="account"
      fields={fields}
      store={accountStore}
      datetimeFields={AccountFields.datetimeFields}
      dateFields={AccountFields.dateFields}
      timeFields={AccountFields.timeFields}
    />
  );
};

export const AccountCard = observer((props: { item: Account }) => {
  const { item } = props;
  const { fetchFcn, shownFields } = useAccountView();
  const { accountStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id"]}
      important={["name"]}
      prices={AccountFields.pricesFields}
      FormComponent={AccountForm}
      deleteItem={accountStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const AccountCollection = observer(() => {
  const { accountStore } = useStore();
  const { pageDetails, PageBar } = useAccountView();

  return (
    <SideBySideView
      SideA={
        <MyGenericCollection
          CardComponent={AccountCard}
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={accountStore.items}
        />
      }
      SideB=""
      ratio={0.7}
    />
  );
});

export const AccountFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new Account({}).$view}
      title="Account Filters"
      dateFields={[
        ...AccountFields.datetimeFields,
        ...AccountFields.dateFields,
      ]}
      excludeFields={["id"]}
      relatedFields={[]}
      optionFields={[]}
    />
  );
});

export const AccountRow = observer((props: { item: Account }) => {
  const { item } = props;
  const { fetchFcn } = useAccountView();
  const { accountStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={AccountForm}
      deleteItem={accountStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const AccountTable = observer(() => {
  const { accountStore } = useStore();
  const values = useAccountView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={accountStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <AccountRow item={item} />}
      priceFields={AccountFields.pricesFields}
      {...values}
    />
  );
});

export const AccountView = observer(() => {
  const { accountStore, settingStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<AccountInterface, Account>(
    settingStore,
    "Account",
    new Account({})
  );
  const { params, setPageDetails } = values;

  const fetchFcn = async () => {
    const resp = await accountStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(() => [] satisfies KV<any>[], []);

  const actionModalDefs = [] satisfies ActionModalDef[];

  return (
    <MyGenericView<AccountInterface>
      title={title}
      FormComponent={AccountForm}
      FilterComponent={AccountFilter}
      Context={AccountViewContext}
      CollectionComponent={AccountCollection}
      TableComponent={AccountTable}
      fetchFcn={fetchFcn}
      actionModalDefs={actionModalDefs}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
