import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { CATEGORY_CHOICES } from "../../api/CategoryStore";
import { useStore } from "../../api/Store";
import { KV } from "../../constants/interfaces";
import { TransactionDashboard } from "../modules/TransactionComponents";
import { View } from "react-native";
import { SideBySideView } from "../../blueprints/SideBySideView";

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
    <SideBySideView
      SideA={<TransactionDashboard graph="pie" itemMap={itemMap} />}
      SideB={<TransactionDashboard graph="line" itemMap={itemMap} />}
      ratio={0.7}
    />
  );
});
