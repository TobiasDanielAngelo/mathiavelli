import { observer } from "mobx-react-lite";
import { useStore } from "../../api/Store";
import { MyDynamicTable } from "../../blueprints/MyDynamicTable";
import { useCredentialView } from "./CredentialProps";
import { CredentialRow } from "./CredentialRow";

export const CredentialTable = observer(() => {
  const { credentialStore } = useStore();
  const { shownFields, params, setParams, pageDetails, itemMap, PageBar } =
    useCredentialView();

  return (
    <MyDynamicTable
      items={credentialStore.items}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      itemMap={itemMap}
      renderActions={(item) => <CredentialRow item={item} />}
    />
  );
});
