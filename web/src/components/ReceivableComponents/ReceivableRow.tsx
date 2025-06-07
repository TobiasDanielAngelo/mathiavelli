import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import PaymentIcon from "@mui/icons-material/Payment";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Receivable } from "../../api/ReceivableStore";
import { useStore } from "../../api/Store";
import { MyConfirmModal } from "../../blueprints/MyConfirmModal";
import { MyModal } from "../../blueprints/MyModal";
import { generateShortId } from "../../constants/helpers";
import { useVisible } from "../../constants/hooks";
import { AccountIdMap } from "../AccountComponents/AccountProps";
import { CategoryIdMap } from "../CategoryComponents/CategoryProps";
import { TransactionForm } from "../TransactionComponents/TransactionForm";
import { ReceivableForm } from "./ReceivableForm";
import { useReceivableView } from "./ReceivableProps";

export const ReceivableRow = observer((props: { item: Receivable }) => {
  const { item } = props;
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
        <ReceivableForm item={item} setVisible={setVisible1} />
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
