import { observer } from "mobx-react-lite";
import { PropsWithChildren, useMemo } from "react";
import { useStore } from "../../api/Store";
import { KV } from "../../blueprints/ItemDetails";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { TransactionDashboard } from "../modules/TransactionComponents";

export const DashboardCard = (
  props: PropsWithChildren<{
    stats: number;
    title: string;
    change?: number;
  }>
) => {
  const { stats, title, change, children } = props;

  return (
    <div
      className="flex flex-row rounded-xl shadow-md h-[100px] p-2 shrink-0 border border-gray-800 bg-gray-900"
      style={{ boxShadow: "6px 6px 12px black" }}
    >
      <div className="rounded-lg border-2 items-center my-auto p-5 mx-5 bg-gradient-to-br from-blue-900 via-blue-500 to-blue-700">
        {children}
      </div>
      <div>
        <div className="text-sm text-gray-500 font-bold">{title}</div>
        <div className="text-lg">
          <span className="font-bold">{stats.toFixed(2)}</span>
          <span className="text-md text-gray-500">
            {change ? ` (+${change?.toFixed(1)})` : ""}
          </span>
        </div>
      </div>
    </div>
  );
};
export const DashboardView = observer(() => {
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
