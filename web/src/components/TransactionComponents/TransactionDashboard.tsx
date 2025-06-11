import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useStore } from "../../api/Store";
import { MyLineChart } from "../../blueprints/MyCharts/MyLineChart";
import { toMoney } from "../../constants/helpers";
import { useTransactionView } from "./TransactionProps";
import { MyPieChart } from "../../blueprints/MyCharts/MyPieChart";

export const TransactionDashboard = observer(() => {
  const { transactionAnalyticsStore } = useStore();
  const { itemMap, graph } = useTransactionView();

  const fetchTransactionAnalytics = async () => {
    const resp = await transactionAnalyticsStore.fetchAll(`graph=${graph}`);
    if (!resp.ok || !resp.data) {
      return;
    }
  };

  useEffect(() => {
    fetchTransactionAnalytics();
  }, [graph]);

  return (
    <>
      {graph === "pie" ? (
        <MyPieChart
          data={transactionAnalyticsStore.items}
          nameKey="category"
          dataKey="total"
          itemMap={itemMap}
          formatter={(value: number, name: string) => [toMoney(value), name]}
        />
      ) : (
        <MyLineChart
          data={transactionAnalyticsStore.items}
          traceKey="account"
          xKey="period"
          yKey="total"
          formatter={(value: number, name: string) => [toMoney(value), name]}
          itemMap={itemMap}
          excludedFromTotal={["Operations"]}
          selectionLabel="Accounts"
        />
      )}
    </>
  );
});

// <MyPieChart / MyRadialBarChart
//   data={transactionAnalyticsStore.items}
//   nameKey="category"
//   dataKey="total"
//   itemMap={itemMap}
//   formatter={(value: number, name: string) => [toMoney(value), name]}
// />

// <MyLineChart / MyBarChart / MyAreaChart / MyRadarChart
//   data={transactionAnalyticsStore.items}
//   traceKey="account"
//   xKey="period"
//   yKey="total"
//   formatter={(value: number, name: string) => [toMoney(value), name]}
//   itemMap={itemMap}
//   excludedFromTotal={["Operations"]}
//   selectionLabel="Accounts"
// />
