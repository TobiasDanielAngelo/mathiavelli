import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import {
  AUTHENTICATOR_CHOICES,
  Credential,
  CredentialFields,
  CredentialInterface,
} from "../../api/CredentialStore";
import { useStore } from "../../api/Store";
import { MyGenericCard } from "../../blueprints/MyGenericComponents/MyGenericCard";
import { MyGenericFilter } from "../../blueprints/MyGenericComponents/MyGenericFilter";
import { MyGenericForm } from "../../blueprints/MyGenericComponents/MyGenericForm";
import { createGenericViewContext } from "../../blueprints/MyGenericComponents/MyGenericProps";
import { MyGenericRow } from "../../blueprints/MyGenericComponents/MyGenericRow";
import { MyGenericTable } from "../../blueprints/MyGenericComponents/MyGenericTable";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { sortAndFilterByIds, toOptions } from "../../constants/helpers";
import { Field } from "../../constants/interfaces";

export const {
  Context: CredentialViewContext,
  useGenericView: useCredentialView,
} = createGenericViewContext<CredentialInterface>();

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
      storeFns={{
        add: credentialStore.addItem,
        update: credentialStore.updateItem,
        delete: credentialStore.deleteItem,
      }}
      datetimeFields={CredentialFields.datetime}
      dateFields={CredentialFields.date}
    />
  );
};

export const CredentialCard = observer((props: { item: Credential }) => {
  const { item } = props;
  const { fetchFcn, shownFields } = useCredentialView();
  const { credentialStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["email", "username"]}
      important={["platformName"]}
      body={[
        "accountNumber",
        "addedAt",
        "associatedEmail",
        "authenticatorEmail",
        "authenticatorAppName",
        "backupCodes",
        "billingAccounts",
        "customAuthenticator",
        "loginMethod",
        "notes",
        "password",
        "pin",
        "recoveryEmail",
        "recoveryPhone",
      ]}
      prices={CredentialFields.prices}
      FormComponent={CredentialForm}
      deleteItem={credentialStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const CredentialCollection = observer(() => {
  const { credentialStore } = useStore();
  const { pageDetails, PageBar } = useCredentialView();

  return (
    <SideBySideView
      SideA={
        <div className="flex flex-col min-h-[85vh]">
          <PageBar />
          <div className="flex-1">
            {sortAndFilterByIds(
              credentialStore.items,
              pageDetails?.ids ?? [],
              (s) => s.id
            ).map((s) => (
              <CredentialCard item={s} key={s.id} />
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

export const CredentialFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new Credential({}).$}
      title="Credential Filters"
      dateFields={[...CredentialFields.date, ...CredentialFields.datetime]}
      excludeFields={["id"]}
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
  const { shownFields, params, setParams, pageDetails, PageBar } =
    useCredentialView();

  return (
    <MyGenericTable
      items={credentialStore.items}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <CredentialRow item={item} />}
      priceFields={CredentialFields.prices}
    />
  );
});
