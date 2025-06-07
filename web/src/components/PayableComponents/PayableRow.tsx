import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import PaymentIcon from "@mui/icons-material/Payment";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Payable } from "../../api/PayableStore";
import { useStore } from "../../api/Store";
import { MyConfirmModal } from "../../blueprints/MyConfirmModal";
import { MyModal } from "../../blueprints/MyModal";
import { useVisible } from "../../constants/hooks";
import { PayableForm } from "./PayableForm";
import { generateShortId } from "../../constants/helpers";
import { AccountIdMap } from "../AccountComponents/AccountProps";
import { CategoryIdMap } from "../CategoryComponents/CategoryProps";
import { TransactionForm } from "../TransactionComponents/TransactionForm";
import { usePayableView } from "./PayableProps";

export const PayableRow = observer((props: { item: Payable }) => {
  const { item } = props;
  const {
    isVisible1,
    setVisible1,
    isVisible2,
    setVisible2,
    isVisible3,
    setVisible3,
  } = useVisible();
  const [msg, setMsg] = useState("");
  const { fetchFcn } = usePayableView();
  const { accountStore } = useStore();
  const onDelete = async () => {
    const resp = await accountStore.deleteItem(item?.id ?? -1);
    if (!resp.ok) {
      setMsg(resp.details);
      return;
    }
    setVisible2(false);
  };

  return (
    <div className="flex justify-evenly">
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
      <CloseIcon
        onClick={() => setVisible2(true)}
        className="cursor-pointer"
        fontSize="small"
      />
    </div>
  );
});
