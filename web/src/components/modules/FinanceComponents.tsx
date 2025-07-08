import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { CATEGORY_CHOICES } from "../../api/CategoryStore";
import { useStore } from "../../api/Store";
import { KV } from "../../blueprints/ItemDetails";
import { TransactionDashboard } from "../modules/TransactionComponents";

export const FinanceView = observer(() => {
  const { categoryStore, accountStore } = useStore();
  const itemMap = useMemo(
    () =>
      [
        {
          key: "transmitter",
          values: accountStore.items,
          label: "name",
        },
        {
          key: "receiver",
          values: accountStore.items,
          label: "name",
        },
        {
          key: "account",
          values: accountStore.items,
          label: "name",
        },
        {
          key: "category",
          values: categoryStore.items,
          label: "title",
        },
        {
          key: "categoryNature",
          values: CATEGORY_CHOICES,
          label: "",
        },
      ] as KV<any>[],
    [categoryStore.items, accountStore.items]
  );

  return (
    <div className="m-2 grid md:grid-cols-2">
      <TransactionDashboard graph="pie" itemMap={itemMap} />
      <TransactionDashboard graph="line" itemMap={itemMap} />
    </div>
  );
});
