import { observer } from "mobx-react-lite";
import { useStore } from "../../api/Store";
import { MyDynamicTable } from "../../blueprints/MyDynamicTable";
import { useAccountView } from "./AccountProps";
import { AccountRow } from "./AccountRow";

export const AccountTable = observer(() => {
  const { accountStore } = useStore();
  const { shownFields, params, setParams, pageDetails, PageBar } =
    useAccountView();

  return (
    <MyDynamicTable
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
