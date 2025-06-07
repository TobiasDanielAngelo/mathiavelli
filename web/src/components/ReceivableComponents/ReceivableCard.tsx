import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import PaymentIcon from "@mui/icons-material/Payment";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useStore } from "../../api/Store";
import { Receivable, ReceivableInterface } from "../../api/ReceivableStore";
import { ItemDetails } from "../../blueprints/ItemDetails";
import { MyConfirmModal } from "../../blueprints/MyConfirmModal";
import { MyModal } from "../../blueprints/MyModal";
import { ReceivableForm } from "../ReceivableComponents/ReceivableForm";
import { useVisible } from "../../constants/hooks";
import { TransactionForm } from "../TransactionComponents/TransactionForm";
import { useReceivableView } from "./ReceivableProps";
import { generateShortId } from "../../constants/helpers";
import { AccountIdMap } from "../AccountComponents/AccountProps";
import { CategoryIdMap } from "../CategoryComponents/CategoryProps";

export const ReceivableCard = observer(
  (props: {
    item: Receivable;
    shownFields?: (keyof ReceivableInterface)[];
  }) => {
    const { item, shownFields } = props;
    const {
      isVisible1,
      setVisible1,
      isVisible2,
      setVisible2,
      isVisible3,
      setVisible3,
    } = useVisible();
    const { fetchFcn } = useReceivableView();
    const [msg, setMsg] = useState("");
    const { receivableStore } = useStore();

    const onDelete = async () => {
      const resp = await receivableStore.deleteItem(item?.id ?? -1);
      if (!resp.ok) {
        setMsg(resp.details);
        return;
      }
      setVisible2(false);
    };

    return (
      <div className="m-1 border-gray-700 rounded-lg p-5 border">
        <MyModal isVisible={isVisible1} setVisible={setVisible1}>
          <ReceivableForm item={item} setVisible={setVisible1} />
        </MyModal>
        <MyModal isVisible={isVisible3} setVisible={setVisible3}>
          <TransactionForm
            item={{
              receivableId: item.id,
              description: `RCV${item.id}-${generateShortId()}`,
              transmitter: AccountIdMap.Operations,
              receiver: AccountIdMap.Wallet,
              category: CategoryIdMap["Receivable Payment"],
            }}
            fetchFcn={fetchFcn}
            setVisible={setVisible3}
          />
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
              header={["id", "datetimeDue"]}
              important={["lentAmount"]}
              body={[
                "borrowerName",
                "description",
                "datetimeOpened",
                "datetimeClosed",
                "paymentDescription",
                "paymentTotal",
              ]}
              prices={["lentAmount", "paymentTotal"]}
            />
            <div className="flex justify-between">
              <PaymentIcon
                onClick={() => setVisible3(true)}
                className="cursor-pointer"
                fontSize="small"
              />
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
