import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Account,
  AccountFields,
  AccountInterface,
} from "../../api/AccountStore";
import { useStore } from "../../api/Store";
import { MyMultiDropdownSelector } from "../../blueprints";
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
} from "../../blueprints/MyGenericComponents/MyGenericView";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { toTitleCase } from "../../constants/helpers";
import { useLocalStorageState, useVisible } from "../../constants/hooks";
import { Field, PaginatedDetails } from "../../constants/interfaces";

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
      storeFns={{
        add: accountStore.addItem,
        update: accountStore.updateItem,
        delete: accountStore.deleteItem,
      }}
      datetimeFields={AccountFields.datetime}
      dateFields={AccountFields.date}
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
      prices={AccountFields.prices}
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
      dateFields={AccountFields.datetime}
      excludeFields={["id"]}
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
  const {
    shownFields,
    params,
    setParams,
    pageDetails,
    PageBar,
    itemMap,
    sortFields,
    setSortFields,
  } = useAccountView();

  return (
    <MyGenericTable
      items={accountStore.items}
      shownFields={shownFields}
      sortFields={sortFields}
      setSortFields={setSortFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <AccountRow item={item} />}
      priceFields={AccountFields.prices}
      itemMap={itemMap}
    />
  );
});

export const AccountView = observer(() => {
  const { accountStore } = useStore();
  const { setVisible1, isVisible, setVisible } = useVisible();
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const [params, setParams] = useSearchParams();
  const objWithFields = new Account({}).$view;
  const [shownFields, setShownFields] = useLocalStorageState(
    Object.keys(objWithFields) as (keyof AccountInterface)[],
    "shownFieldsAccount"
  );
  const [sortFields, setSortFields] = useLocalStorageState(
    [] as string[],
    "sortFieldsAccount"
  );
  const fetchFcn = async () => {
    const resp = await accountStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(() => [] satisfies KV<any>[], []);

  const actionModalDefs = [
    {
      icon: "NoteAdd",
      label: "NEW",
      name: "Add a Account",
      modal: <AccountForm fetchFcn={fetchFcn} setVisible={setVisible1} />,
    },
    {
      icon: "ViewList",
      label: "FIELDS",
      name: "Show Fields",
      modal: (
        <MyMultiDropdownSelector
          label="Fields"
          value={shownFields}
          onChangeValue={(t) => setShownFields(t as (keyof AccountInterface)[])}
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
      modal: <AccountFilter />,
    },
  ] satisfies ActionModalDef[];

  return (
    <MyGenericView<AccountInterface>
      title={title}
      fetchFcn={fetchFcn}
      actionModalDefs={actionModalDefs}
      isVisible={isVisible}
      setVisible={setVisible}
      Context={AccountViewContext}
      CollectionComponent={AccountCollection}
      TableComponent={AccountTable}
      shownFields={shownFields}
      setShownFields={setShownFields}
      sortFields={sortFields}
      setSortFields={setSortFields}
      availableGraphs={["pie", "line"]}
      pageDetails={pageDetails}
      params={params}
      setParams={setParams}
      itemMap={itemMap}
    />
  );
});
