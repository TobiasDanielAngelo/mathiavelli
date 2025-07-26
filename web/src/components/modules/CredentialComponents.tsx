import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import {
  AUTHENTICATOR_CHOICES,
  Credential,
  CredentialInterface,
} from "../../api/CredentialStore";
import { useStore } from "../../api/Store";
import { MyGenericCard } from "../../blueprints/MyGenericComponents/MyGenericCard";
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
import { SideBySideView } from "../../blueprints/SideBySideView";
import { toOptions } from "../../constants/helpers";
import { useVisible } from "../../constants/hooks";
import { ActionModalDef, Field, KV } from "../../constants/interfaces";

export const {
  Context: CredentialViewContext,
  useGenericView: useCredentialView,
} = createGenericViewContext<CredentialInterface>();

const title = "Credentials";

export const CredentialIdMap = {} as const;

export const CredentialForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: Credential;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { credentialStore, platformStore, accountStore } = useStore();

  const fields = useMemo(
    () =>
      [
        [
          {
            name: "platform",
            label: "Platform",
            type: "select",
            options: toOptions(platformStore.items, "name"),
          },
        ],
        [
          {
            name: "billingAccounts",
            label: "Billing Accounts",
            type: "multi",
            options: toOptions(accountStore.items, "name"),
          },
        ],
        [{ name: "username", label: "Username", type: "text" }],
        [{ name: "email", label: "Email", type: "text" }],
        [{ name: "password", label: "Password", type: "text" }],
        [{ name: "backupCodes", label: "Backup Codes", type: "textarea" }],
        [{ name: "pin", label: "Pin", type: "text" }],
        [{ name: "accountNumber", label: "Account Number", type: "text" }],
        [{ name: "associatedEmail", label: "Associated Email", type: "text" }],
        [{ name: "recoveryEmail", label: "Recovery Email", type: "text" }],
        [{ name: "recoveryPhone", label: "Recovery Phone", type: "text" }],
        [{ name: "loginMethod", label: "Login Method", type: "text" }],
        [{ name: "dateCreated", label: "Date Created", type: "date" }],
        [{ name: "profileUrl", label: "Profile Url", type: "text" }],
        [
          {
            name: "authenticatorApp",
            label: "Authenticator App",
            type: "select",
            options: toOptions(AUTHENTICATOR_CHOICES),
          },
        ],
        [
          {
            name: "customAuthenticator",
            label: "Custom Authenticator",
            type: "text",
          },
        ],
        [
          {
            name: "authenticatorEmail",
            label: "Authenticator Email",
            type: "text",
          },
        ],
        [{ name: "notes", label: "Notes", type: "textarea" }],
        [{ name: "addedAt", label: "Added At", type: "datetime" }],
      ] satisfies Field[][],
    [platformStore.items.length, accountStore.items.length]
  );
  return (
    <MyGenericForm<CredentialInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="credential"
      fields={fields}
      store={credentialStore}
      datetimeFields={credentialStore.datetimeFields}
      dateFields={credentialStore.dateFields}
      timeFields={credentialStore.timeFields}
    />
  );
};

export const CredentialCard = observer((props: { item: Credential }) => {
  const { item } = props;
  const { fetchFcn, shownFields, itemMap, related } = useCredentialView();
  const { credentialStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id", "email", "username"]}
      important={["platform"]}
      prices={credentialStore.priceFields}
      FormComponent={CredentialForm}
      deleteItem={credentialStore.deleteItem}
      fetchFcn={fetchFcn}
      itemMap={itemMap}
      related={related}
    />
  );
});

export const CredentialCollection = observer(() => {
  const { credentialStore } = useStore();
  const { pageDetails, PageBar } = useCredentialView();

  return (
    <SideBySideView
      SideA={
        <MyGenericCollection
          CardComponent={CredentialCard}
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={credentialStore.items}
        />
      }
      SideB=""
      ratio={0.7}
    />
  );
});

export const CredentialFilter = observer(() => {
  const { credentialStore } = useStore();
  return (
    <MyGenericFilter
      view={new Credential({}).$view}
      title="Credential Filters"
      dateFields={[
        ...credentialStore.dateFields,
        ...credentialStore.datetimeFields,
      ]}
      relatedFields={credentialStore.relatedFields}
      optionFields={credentialStore.optionFields}
    />
  );
});

export const CredentialRow = observer((props: { item: Credential }) => {
  const { item } = props;
  const { fetchFcn } = useCredentialView();
  const { credentialStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={CredentialForm}
      deleteItem={credentialStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const CredentialTable = observer(() => {
  const { credentialStore } = useStore();
  const values = useCredentialView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={credentialStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <CredentialRow item={item} />}
      priceFields={credentialStore.priceFields}
      {...values}
    />
  );
});

export const CredentialView = observer(() => {
  const { credentialStore, settingStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<CredentialInterface, Credential>(
    settingStore,
    "Credential",
    new Credential({})
  );
  const { params, setPageDetails } = values;
  const fetchFcn = async () => {
    const resp = await credentialStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(() => [] satisfies KV<any>[], []);

  const actionModalDefs = [] satisfies ActionModalDef[];

  return (
    <MyGenericView<CredentialInterface>
      title={title}
      Context={CredentialViewContext}
      CollectionComponent={CredentialCollection}
      FormComponent={CredentialForm}
      FilterComponent={CredentialFilter}
      actionModalDefs={actionModalDefs}
      TableComponent={CredentialTable}
      related={credentialStore.related}
      fetchFcn={fetchFcn}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
