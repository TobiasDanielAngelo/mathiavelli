import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useStore } from "../../api/Store";
import { BuyListItem } from "../../api/BuyListItemStore";
import { MyConfirmModal } from "../../blueprints/MyConfirmModal";
import { MyModal } from "../../blueprints/MyModal";
import { BuyListItemForm } from "./BuyListItemForm";
import { useVisible } from "../../constants/hooks";

export const BuyListItemRow = observer((props: { item: BuyListItem }) => {
  const { item } = props;
  const { isVisible1, setVisible1, isVisible2, setVisible2 } = useVisible();
  const [msg, setMsg] = useState("");
  const { buyListItemStore } = useStore();
  const onDelete = async () => {
    const resp = await buyListItemStore.deleteItem(item?.id ?? -1);
    if (!resp.ok) {
      setMsg(resp.details);
      return;
    }
    setVisible2(false);
  };

  return (
    <div className="flex justify-evenly">
      <MyModal isVisible={isVisible1} setVisible={setVisible1}>
        <BuyListItemForm item={item} setVisible={setVisible1} />
      </MyModal>
      <MyConfirmModal
        isVisible={isVisible2}
        setVisible={setVisible2}
        onClickCheck={onDelete}
        actionName="Delete"
        msg={msg}
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
