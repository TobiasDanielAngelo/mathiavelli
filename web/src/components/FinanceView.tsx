import { useState } from "react";
import type { ITransaction } from "../constants/interfaces";

export const FinanceView = () => {
  const [transaction, setTransaction] = useState<ITransaction>({
    description: "",
    amount: 0,
    creditAcct: -1,
    debitAcct: -1,
  });

  return (
    <div className="">
      Finance App
      <div className="flex flex-row gap-2">
        <input
          className="border border-white text-center h-10"
          value={transaction?.amount}
          onChange={(t) =>
            setTransaction({ ...transaction, amount: Number(t.target.value) })
          }
        />
        <input
          className="border border-white text-center h-10"
          value={transaction?.description}
          onChange={(t) =>
            setTransaction({ ...transaction, description: t.target.value })
          }
        />
        <select
          className="border border-white text-center h-10"
          value={transaction?.creditAcct}
          onChange={(t) =>
            setTransaction({
              ...transaction,
              creditAcct: Number(t.target.value),
            })
          }
        >
          {[1, 2, 3, 4, 5].map((s) => (
            <option value={s} key={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
