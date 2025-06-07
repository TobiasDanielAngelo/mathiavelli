import moment from "moment";
import { useMemo, useState } from "react";
import { CredentialInterface } from "../../api/CredentialStore";
import { useStore } from "../../api/Store";
import { MyForm } from "../../blueprints/MyForm";
import { Field } from "../../constants/interfaces";
import { toOptions } from "../../constants/helpers";
import { authenticatorApps } from "../../constants/constants";

export const CredentialForm = (props: {
  item?: CredentialInterface;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { item, setVisible, fetchFcn } = props;
  const { platformStore, credentialStore, accountStore } = useStore();
  const [details, setDetails] = useState<CredentialInterface>({
    platform: item?.platform,
    billingAccounts: item?.billingAccounts ?? [],
    username: item?.username,
    email: item?.email,
    password: item?.password,
    backupCodes: item?.backupCodes,
    pin: item?.pin,
    accountNumber: item?.accountNumber,
    associatedEmail: item?.associatedEmail,
    recoveryEmail: item?.recoveryEmail,
    recoveryPhone: item?.recoveryPhone,
    loginMethod: item?.loginMethod,
    dateCreated: moment(item?.dateCreated).format("MMM D, YYYY"),
    profileUrl: item?.profileUrl,
    authenticatorApp: item?.authenticatorApp,
    customAuthenticator: item?.customAuthenticator,
    authenticatorEmail: item?.authenticatorEmail,
    notes: item?.notes,
    addedAt: moment(item?.addedAt).format("MMM D, YYYY h:mm A"),
  });
  const [msg, setMsg] = useState<Object>();
  const [isLoading, setLoading] = useState(false);

  const rawFields = useMemo(
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
            options: toOptions(authenticatorApps),
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

  const onClickCreate = async () => {
    setLoading(true);
    const resp = await credentialStore.addItem({
      ...details,
      dateCreated: moment(details.dateCreated, "MMM D, YYYY").format(
        "YYYY-MM-DD"
      ),
      addedAt: moment(details.addedAt, "MMM D YYYY h:mm A").toISOString(),
    });
    setLoading(false);

    if (!resp.ok) {
      setMsg(resp.details);
      return;
    }
    fetchFcn && fetchFcn();
    setVisible && setVisible(false);
  };

  const onClickEdit = async () => {
    if (!item?.id) return;
    setLoading(true);
    const resp = await credentialStore.updateItem(item.id, {
      ...details,
      dateCreated: moment(details.dateCreated, "MMM D, YYYY").format(
        "YYYY-MM-DD"
      ),
      addedAt: moment(details.addedAt, "MMM D YYYY h:mm A").toISOString(),
    });
    setLoading(false);

    if (!resp.ok) {
      setMsg(resp.details);
      return;
    }
    fetchFcn && fetchFcn();
    setVisible && setVisible(false);
  };

  const onClickDelete = async () => {
    if (!item?.id) return;
    setLoading(true);
    const resp = await credentialStore.deleteItem(item.id);
    setLoading(false);

    if (!resp.ok) {
      setMsg(resp.details);
      return;
    }
    fetchFcn && fetchFcn();
    setVisible && setVisible(false);
  };

  return (
    <div className="items-center">
      <MyForm
        fields={rawFields}
        title={item?.id ? "Edit Credential" : "Credential Creation Form"}
        details={details}
        setDetails={setDetails}
        onClickSubmit={item?.id ? onClickEdit : onClickCreate}
        hasDelete={!!item}
        onDelete={onClickDelete}
        objectName="credential"
        msg={msg}
        isLoading={isLoading}
      />
    </div>
  );
};
