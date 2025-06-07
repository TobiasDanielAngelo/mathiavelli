import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useStore } from "../../api/Store";
import { Credential, CredentialInterface } from "../../api/CredentialStore";
import { ItemDetails } from "../../blueprints/ItemDetails";
import { MyConfirmModal } from "../../blueprints/MyConfirmModal";
import { MyModal } from "../../blueprints/MyModal";
import { CredentialForm } from "./CredentialForm";
import { useVisible } from "../../constants/hooks";

export const CredentialCard = observer(
  (props: {
    item: Credential;
    shownFields?: (keyof CredentialInterface)[];
  }) => {
    const { item, shownFields } = props;
    const { isVisible1, setVisible1, isVisible2, setVisible2 } = useVisible();
    const [msg, setMsg] = useState("");
    const { credentialStore } = useStore();

    const onDelete = async () => {
      const resp = await credentialStore.deleteItem(item?.id ?? -1);
      if (!resp.ok) {
        setMsg(resp.details);
        return;
      }
      setVisible2(false);
    };

    console.log(item.platformName);

    return (
      <div className="m-1 border-gray-700 rounded-lg p-5 border">
        <MyModal isVisible={isVisible1} setVisible={setVisible1}>
          <CredentialForm item={item} setVisible={setVisible1} />
        </MyModal>
        <MyConfirmModal
          isVisible={isVisible2}
          setVisible={setVisible2}
          onClickCheck={onDelete}
          actionName="Delete"
          msg={msg}
        />

        <div className="flex justify-between">
          <div className="flex-1">
            <div className="flex justify-end">
              <CloseIcon
                onClick={() => setVisible2(true)}
                className="cursor-pointer"
                fontSize="small"
              />
            </div>
            <ItemDetails
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
            />
            <div className="flex justify-end">
              <EditIcon
                onClick={() => setVisible1(true)}
                className="cursor-pointer"
                fontSize="small"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);
