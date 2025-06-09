import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useStore } from "../../api/Store";
import { MyPieChart } from "../../blueprints/MyCharts/MyPieChart";
import { useTransactionView } from "./TransactionProps";
import { toMoney } from "../../constants/helpers";
import { MyLineChart } from "../../blueprints/MyCharts/MyLineChart";

export const TransactionDashboard = observer(() => {
  const { transactionAnalyticsStore } = useStore();
  const { itemMap } = useTransactionView();

  const fetchTransactionAnalytics = async () => {
    const resp = await transactionAnalyticsStore.fetchAll();
    if (!resp.ok || !resp.data) {
      return;
    }
  };

  useEffect(() => {
    fetchTransactionAnalytics();
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center">
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
    </div>
  );
});

// <MyPieChart
//   data={transactionAnalyticsStore.items}
//   nameKey="category"
//   dataKey="total"
//   itemMap={itemMap}
//   formatter={(value: number, name: string) => [toMoney(value), name]}
// />
