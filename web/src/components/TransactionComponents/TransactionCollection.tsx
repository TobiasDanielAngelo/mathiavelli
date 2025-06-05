import { observer } from "mobx-react-lite";
import { useStore } from "../../api/Store";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { TransactionCard } from "../TransactionComponents/TransactionCard";
import { useTransactionView } from "./TransactionProps";

export const TransactionCollection = observer(() => {
  const { transactionStore } = useStore();
  const { shownFields, pageDetails, PageBar } = useTransactionView();

  return (
    <SideBySideView
      SideA={
        <div className="flex flex-col min-h-[85vh]">
          <PageBar />
          <div className="flex-1">
            {transactionStore.items
              .filter((s) => pageDetails?.ids?.includes(s.id))
              .sort((a, b) => {
                return (
                  (pageDetails?.ids?.indexOf(a.id) ?? 0) -
                  (pageDetails?.ids?.indexOf(b.id) ?? 0)
                );
              })
              .map((s) => (
                <TransactionCard
                  item={s}
                  key={s.id}
                  shownFields={shownFields}
                />
              ))}
          </div>
          <PageBar />
        </div>
      }
      SideB=""
      ratio={0.7}
    />
  );
});
