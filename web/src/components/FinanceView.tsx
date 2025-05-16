import AddCardIcon from "@mui/icons-material/AddCard";
import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { MyModal } from "../blueprints/MyModal";
import { MySpeedDial } from "../blueprints/MySpeedDial";
import { AccountForm } from "./AccountForm";
import { TransactionForm } from "./TransactionForm";
import { TransactionInterface } from "../api/TransactionStore";
import { useStore } from "../api/Store";
import { MyConfirmModal } from "../blueprints/MyConfirmModal";
import moment from "moment";
import CloseIcon from "@mui/icons-material/Close";
import { toMoney } from "../constants/helpers";

export const TransactionItem = observer(
  (props: { item?: TransactionInterface }) => {
    const { item } = props;
    const [isVisible1, setVisible1] = useState(false);
    const [isVisible2, setVisible2] = useState(false);
    const [msg, setMsg] = useState("");
    const { transactionStore, accountStore } = useStore();

    const onDelete = async () => {
      const resp = await transactionStore.deleteItem(item?.id ?? -1);
      if (!resp.ok) {
        setMsg(resp.details);
        return;
      }
      setVisible1(false);
    };

    return (
      <div className="flex justify-between m-2 border border-gray-500 rounded-lg p-2">
        <MyModal isVisible={isVisible1} setVisible={setVisible1}>
          <TransactionForm item={item} setVisible={setVisible1} />
        </MyModal>
        <MyConfirmModal
          isVisible={isVisible2}
          setVisible={setVisible2}
          onClickCheck={onDelete}
          actionName="Delete"
          msg={msg}
        />
        <div className="flex-1 mx-5">
          <div className="flex flex-row gap-1 text-xs text-left text-gray-400">
            <div>
              {moment(item?.datetimeTransacted).format("MMM D, YYYY h:mm A ")}
            </div>
            <div>
              ({accountStore.allItems.get(item?.transmitter ?? -1)?.name}
            </div>
            <div>to</div>
            <div>{accountStore.allItems.get(item?.receiver ?? -1)?.name})</div>
          </div>
          <div className="flex flex-row justify-between">
            <div
              className="hover:underline cursor-pointer"
              onClick={() => setVisible1(true)}
            >
              {item?.description}
            </div>

            <div
              className="hover:underline cursor-pointer"
              onClick={() => setVisible1(true)}
            >
              {toMoney(item?.amount)}
            </div>
          </div>
        </div>
        <CloseIcon
          onClick={() => setVisible2(true)}
          className="cursor-pointer"
          fontSize="small"
        />
      </div>
    );
  }
);

export const FinanceView = observer(() => {
  const [isVisible1, setVisible1] = useState(false);
  const [isVisible2, setVisible2] = useState(false);

  const { transactionStore } = useStore();

  const actions = useMemo(
    () => [
      {
        icon: <AddCardIcon />,
        name: "Add an Account",
        onClick: () => setVisible1(true),
      },
    ],
    []
  );

  return (
    <div className="items-center m-auto md:w-1/2 p-4">
      <MyModal isVisible={isVisible1} setVisible={setVisible1} disableClose>
        <AccountForm setVisible={setVisible1} />
      </MyModal>
      <MyModal isVisible={isVisible2} setVisible={setVisible2} disableClose>
        <TransactionForm setVisible={setVisible2} />
      </MyModal>
      <div className="flex-1 w-full overflow-y-auto space-y-2">
        {transactionStore.items.map((s) => (
          <TransactionItem item={s} key={s.id} />
        ))}
      </div>
      <MySpeedDial
        actions={actions}
        onClick={() => setVisible2(true)}
        title="Add a Transaction"
      />
    </div>
  );
});
