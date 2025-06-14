import { observer } from "mobx-react-lite";
import { Account, AccountInterface } from "../../api/AccountStore";
import { useStore } from "../../api/Store";
import {
  MyGenericView,
  usePageBarWithState,
} from "../../blueprints/MyGenericComponents/MyGenericView";
import { MyMultiDropdownSelector } from "../../blueprints/MyMultiDropdownSelector";
import { toTitleCase } from "../../constants/helpers";
import { useVisible } from "../../constants/hooks";
import {
  AccountCollection,
  AccountFilter,
  AccountForm,
  AccountTable,
  AccountViewContext,
} from "./AccountComponents";

export const AccountView = observer(() => {
  const { accountStore } = useStore();
  const { setVisible1, isVisible, setVisible } = useVisible();

  const fetchFcn = async () => {
    const resp = await accountStore.fetchAll(queryString);
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const pageBarWithStateProps = usePageBarWithState<AccountInterface>(
    "shownFieldsAccount",
    new Account({}).$,
    fetchFcn,
    ["pie", "line"]
  );

  const { queryString, shownFields, setShownFields, setPageDetails } =
    pageBarWithStateProps;

  const actionModalDefs = [
    {
      icon: "NoteAdd",
      label: "ACCT",
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
          options={Object.keys(new Account({}).$).map((s) => ({
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
  ] as const;

  return (
    <MyGenericView
      fetchFcn={fetchFcn}
      actionModalDefs={actionModalDefs}
      isVisible={isVisible}
      setVisible={setVisible}
      Context={AccountViewContext}
      CollectionComponent={AccountCollection}
      TableComponent={AccountTable}
      {...pageBarWithStateProps}
    />
  );
});
