import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import PaymentIcon from "@mui/icons-material/Payment";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useStore } from "../../api/Store";
import { Payable, PayableInterface } from "../../api/PayableStore";
import { ItemDetails } from "../../blueprints/ItemDetails";
import { MyConfirmModal } from "../../blueprints/MyConfirmModal";
import { MyModal } from "../../blueprints/MyModal";
import { PayableForm } from "../PayableComponents/PayableForm";
import { useVisible } from "../../constants/hooks";
import { TransactionForm } from "../TransactionComponents/TransactionForm";
import { usePayableView } from "./PayableProps";
import { generateShortId } from "../../constants/helpers";
import { AccountIdMap } from "../AccountComponents/AccountProps";
import { CategoryIdMap } from "../CategoryComponents/CategoryProps";

export const PayableCard = observer(
  (props: { item: Payable; shownFields?: (keyof PayableInterface)[] }) => {
    const { item, shownFields } = props;
    const {
      isVisible1,
      setVisible1,
      isVisible2,
      setVisible2,
      isVisible3,
      setVisible3,
    } = useVisible();
    const { fetchFcn } = usePayableView();
    const [msg, setMsg] = useState("");
    const { payableStore } = useStore();

    const onDelete = async () => {
      const resp = await payableStore.deleteItem(item?.id ?? -1);
      if (!resp.ok) {
        setMsg(resp.details);
        return;
      }
      setVisible2(false);
    };

    return (
      <div className="m-1 border-gray-700 rounded-lg p-5 border">
        <MyModal isVisible={isVisible1} setVisible={setVisible1}>
          <PayableForm item={item} setVisible={setVisible1} />
        </MyModal>
        <MyConfirmModal
          isVisible={isVisible2}
          setVisible={setVisible2}
          onClickCheck={onDelete}
          actionName="Delete"
          msg={msg}
        />
        <MyModal isVisible={isVisible3} setVisible={setVisible3}>
          <TransactionForm
            item={{
              payableId: item.id,
              description: `PAY${item.id}-${generateShortId()}`,
              transmitter: AccountIdMap.Wallet,
              receiver: AccountIdMap.Operations,
              category: CategoryIdMap["Payable Payment"],
            }}
            fetchFcn={fetchFcn}
            setVisible={setVisible3}
          />
        </MyModal>
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
              important={["borrowedAmount"]}
              body={[
                "lenderName",
                "description",
                "datetimeOpened",
                "datetimeClosed",
                "paymentDescription",
                "paymentTotal",
              ]}
              prices={["borrowedAmount", "paymentTotal"]}
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
