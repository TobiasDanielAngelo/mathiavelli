import { observer } from "mobx-react-lite";
import { Account, AccountFields } from "../../api/AccountStore";
import { useStore } from "../../api/Store";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { sortAndFilterByIds } from "../../constants/helpers";
import { Field } from "../../constants/interfaces";
import { MyGenericCard } from "../../blueprints/MyGenericComponents/MyGenericCard";
import { MyGenericFilter } from "../../blueprints/MyGenericComponents/MyGenericFilter";
import { MyGenericForm } from "../../blueprints/MyGenericComponents/MyGenericForm";
import { MyGenericRow } from "../../blueprints/MyGenericComponents/MyGenericRow";
import { MyGenericTable } from "../../blueprints/MyGenericComponents/MyGenericTable";
import { AccountInterface } from "../../api/AccountStore";
import { createGenericViewContext } from "../../blueprints/MyGenericComponents/MyGenericProps";

export const { Context: AccountViewContext, useGenericView: useAccountView } =
  createGenericViewContext<AccountInterface>();

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
        <div className="flex flex-col min-h-[85vh]">
          <PageBar />
          <div className="flex-1">
            {sortAndFilterByIds(
              accountStore.items,
              pageDetails?.ids ?? [],
              (s) => s.id
            ).map((s) => (
              <AccountCard item={s} key={s.id} />
            ))}
          </div>
          <PageBar />
        </div>
      }
      SideB=""
      ratio={0.7}
    />
  );
});

export const AccountFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new Account({}).$}
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
  const { shownFields, params, setParams, pageDetails, PageBar } =
    useAccountView();

  return (
    <MyGenericTable
      items={accountStore.items}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <AccountRow item={item} />}
    />
  );
});
