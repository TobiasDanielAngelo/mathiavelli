import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";
import { CATEGORY_CHOICES } from "../../api/CategoryStore";
import { useStore } from "../../api/Store";
import { KV } from "../../blueprints/ItemDetails";
import { MyGenericCollection } from "../../blueprints/MyGenericComponents/MyGenericCollection";
import { TwoDates } from "../../constants/classes";
import { useCalendarProps } from "../../constants/hooks";
import { EventCard, EventDisplay } from "../modules/EventComponents";
import { TaskDashboard } from "../modules/TaskComponents";
import { TransactionDashboard } from "../modules/TransactionComponents";
import { WeighInDashboard } from "../modules/WeighInComponents";

export const DashboardView = observer(() => {
  const { transactionStore, categoryStore, accountStore, eventStore } =
    useStore();

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

  const calendarProps = useCalendarProps();
  const { start, end, date } = calendarProps;

  const fetchFcn = async () => {
    const newParams = new URLSearchParams({
      page: "all",
      date_start__gte: start.toISOString(),
      date_start__lte: end.toISOString(),
      order_by: "date_start",
    });
    const resp = await eventStore.fetchAll(newParams.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
  };

  useEffect(() => {
    fetchFcn();
  }, [date]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 m-2 gap-5">
      <EventDisplay calendarProps={calendarProps} />
      <MyGenericCollection
        items={eventStore.items.filter(
          (s) => !s.isArchived && new TwoDates(s.dateStart, date).isEqualDate
        )}
        CardComponent={EventCard}
        title="Events"
      />
      <TaskDashboard />
      <TransactionDashboard graph="pie" itemMap={itemMap} />
      <TransactionDashboard graph="line" itemMap={itemMap} />
      <WeighInDashboard />
    </div>
  );
});
