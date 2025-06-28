import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { useStore } from "../../api/Store";
import { KV } from "../../blueprints/ItemDetails";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { TransactionDashboard } from "../modules/TransactionComponents";
import { CATEGORY_CHOICES } from "../../api/CategoryStore";

export const FinanceView = observer(() => {
  const { transactionStore, categoryStore, accountStore } = useStore();
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
    [
      transactionStore.items.length,
      categoryStore.items.length,
      accountStore.items.length,
    ]
  );

  return (
    <div className="m-2">
      <SideBySideView
        SideA={<TransactionDashboard graph="pie" itemMap={itemMap} />}
        SideB={<TransactionDashboard graph="line" itemMap={itemMap} />}
      />
    </div>
  );
});
