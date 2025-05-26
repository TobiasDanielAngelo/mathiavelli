import AddCardIcon from "@mui/icons-material/AddCard";
import AddIcon from "@mui/icons-material/Add";
import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { useStore } from "../api/Store";
import { MyModal } from "../blueprints/MyModal";
import { MySpeedDial } from "../blueprints/MySpeedDial";
import { sortByKey, toTitleCase } from "../constants/helpers";
import { AccountForm } from "./AccountForm";
import { TransactionForm } from "./TransactionForm";
import { TransactionItem } from "./TransactionItem";
import { SideBySideView } from "../blueprints/SideBySideView";
import { Transaction, TransactionInterface } from "../api/TransactionStore";
import { MyMultiDropdownSelector } from "../blueprints/MyMultiDropdownSelector";

export const FinanceView = observer(() => {
  const [isVisible1, setVisible1] = useState(false);
  const [isVisible2, setVisible2] = useState(false);
  const [isVisible3, setVisible3] = useState(false);

  const { transactionStore } = useStore();

  const [shownFields, setShownFields] = useState<
    (keyof TransactionInterface)[]
  >(Object.keys(new Transaction({}).$) as (keyof TransactionInterface)[]);

  const actions = useMemo(
    () => [
      {
        icon: (
          <div className="flex flex-col items-center">
            <AddCardIcon fontSize="large" />
            <div className="text-xs text-gray-500 font-bold">ACCT</div>
          </div>
        ),
        name: "Add an Account",
        onClick: () => setVisible1(true),
      },
      {
        icon: (
          <div className="flex flex-col items-center">
            <AddCardIcon fontSize="large" />
            <div className="text-xs text-gray-500 font-bold">TXN</div>
          </div>
        ),
        name: "Add a Transaction",
        onClick: () => setVisible2(true),
      },
      {
        icon: (
          <div className="flex flex-col items-center">
            <AddCardIcon fontSize="large" />
            <div className="text-xs text-gray-500 font-bold">FIELDS</div>
          </div>
        ),
        name: "Filter Fields",
        onClick: () => setVisible3(true),
      },
    ],
    []
  );

  return (
    <>
      <MyModal isVisible={isVisible1} setVisible={setVisible1} disableClose>
        <AccountForm setVisible={setVisible1} />
      </MyModal>
      <MyModal isVisible={isVisible2} setVisible={setVisible2} disableClose>
        <TransactionForm setVisible={setVisible2} />
      </MyModal>
      <MyModal isVisible={isVisible3} setVisible={setVisible3} disableClose>
        <MyMultiDropdownSelector
          label="Fields"
          value={shownFields}
          onChangeValue={(t) =>
            setShownFields(t as (keyof TransactionInterface)[])
          }
          options={Object.keys(new Transaction({}).$).map((s) => ({
            id: s,
            name: toTitleCase(s),
          }))}
          relative
          open
        />
      </MyModal>
      <MySpeedDial actions={actions} />
      <SideBySideView
        SideA={
          transactionStore.items.length ? (
            sortByKey(transactionStore.items, "datetimeTransacted").map((s) => (
              <TransactionItem item={s} key={s.id} shownFields={shownFields} />
            ))
          ) : (
            <div className="justify-center items-center flex flex-col text-blue-400">
              <AddIcon
                fontSize="large"
                onClick={() => setVisible2(true)}
                className="cursor-pointer"
              />
              <div>Add a New Transaction</div>
            </div>
          )
        }
        SideB=""
        ratio={0.7}
      />
    </>
  );
});
