import { observer } from "mobx-react-lite";
import moment from "moment";
import { useMemo, useState } from "react";
import {
  FREQ_CHOICES,
  Schedule,
  ScheduleFields,
  ScheduleInterface,
  WEEKDAY_CHOICES,
} from "../../api/ScheduleStore";
import { useStore } from "../../api/Store";
import { KV, ActionModalDef, CalendarView } from "../../constants/interfaces";
import { MyCalendar } from "../../blueprints/MyCalendar";
import { MyGenericCard } from "../../blueprints/MyGenericComponents/MyGenericCard";
import { MyGenericCollection } from "../../blueprints/MyGenericComponents/MyGenericCollection";
import { MyGenericFilter } from "../../blueprints/MyGenericComponents/MyGenericFilter";
import { MyGenericForm } from "../../blueprints/MyGenericComponents/MyGenericForm";
import { createGenericViewContext } from "../../blueprints/MyGenericComponents/MyGenericProps";
import { MyGenericRow } from "../../blueprints/MyGenericComponents/MyGenericRow";
import { MyGenericTable } from "../../blueprints/MyGenericComponents/MyGenericTable";
import {
  MyGenericView,
  useViewValues,
} from "../../blueprints/MyGenericComponents/MyGenericView";
import { MyLockedCard } from "../../blueprints/MyLockedCard";
import { SideBySideView } from "../../blueprints/SideBySideView";
import {
  generateCollidingDates,
  generateScheduleDefinition,
  range,
  toOptions,
} from "../../constants/helpers";
import { useVisible } from "../../constants/hooks";
import { Field, StateSetter } from "../../constants/interfaces";
import { formatValue } from "../../constants/JSXHelpers";

export const { Context: ScheduleViewContext, useGenericView: useScheduleView } =
  createGenericViewContext<ScheduleInterface>();

const title = "Schedules";

export const ScheduleIdMap = {} as const;

export const ScheduleForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: Schedule;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { scheduleStore } = useStore();

  const fields = useMemo(
    () =>
      [
        [
          { name: "name", label: "Name", type: "text" },
          { name: "count", label: "Count", type: "text" },
        ],
        [
          {
            name: "freq",
            label: "Frequency",
            type: "select",
            options: toOptions(FREQ_CHOICES),
          },
          { name: "interval", label: "Interval", type: "text" },
          {
            name: "weekStart",
            label: "Week Start",
            type: "select",
            options: toOptions(WEEKDAY_CHOICES),
          },
        ],
        [
          {
            name: "byWeekDay",
            label: "By Week Day",
            type: "multi",
            options: ["MO", "TU", "WE", "TH", "FR", "SA", "SU"].map((s) => ({
              id: s,
              name: s,
            })),
          },
          {
            name: "byMonthDay",
            label: "By Month Day",
            type: "multi",
            options: range(1, 32).map((s) => ({ id: s, name: `${s}` })),
          },
          {
            name: "byYearDay",
            label: "By Year Day",
            type: "multi",
            options: range(1, 367).map((s) => ({ id: s, name: `${s}` })),
          },
        ],
        [
          {
            name: "byMonth",
            label: "By Month #",
            type: "multi",
            options: range(1, 13).map((s) => ({ id: s, name: `${s}` })),
          },
          {
            name: "byWeekNo",
            label: "By Week #",
            type: "multi",
            options: range(1, 54).map((s) => ({ id: s, name: `${s}` })),
          },
          {
            name: "bySetPosition",
            label: "By Set Position",
            type: "multi",
            options: range(-31, 32).map((s) => ({ id: s, name: `${s}` })),
          },
        ],
        [
          {
            name: "byHour",
            label: "By Hour",
            type: "multi",
            options: range(0, 24).map((s) => ({ id: s, name: `${s}` })),
          },

          {
            name: "byMinute",
            label: "By Minute",
            type: "multi",
            options: range(0, 60).map((s) => ({ id: s, name: `${s}` })),
          },

          {
            name: "bySecond",
            label: "By Second",
            type: "multi",
            options: range(0, 60).map((s) => ({ id: s, name: `${s}` })),
          },
        ],
        [
          { name: "startDate", label: "Start Date", type: "date" },
          { name: "startTime", label: "Start Time", type: "time" },
        ],
        [
          { name: "endDate", label: "End Date", type: "date" },
          { name: "endTime", label: "End Time", type: "time" },
        ],
        [
          {
            name: "scheduleDefinitions",
            label: "Schedule Definition",
            type: "function",
            function: (t) => generateScheduleDefinition(t),
          },
        ],
        [
          {
            name: "collidings",
            label: "Colliding Dates",
            type: "function",
            function: (t) =>
              formatValue(
                generateCollidingDates(t),
                "",
                [],
                undefined,
                isNaN(parseInt(t.count))
              ),
          },
        ],
      ] satisfies Field[][],
    []
  );

  return (
    <MyGenericForm<ScheduleInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="schedule"
      fields={fields}
      store={scheduleStore}
      datetimeFields={ScheduleFields.datetimeFields}
      dateFields={ScheduleFields.dateFields}
      timeFields={ScheduleFields.timeFields}
    />
  );
};

export const ScheduleCard = observer((props: { item: Schedule }) => {
  const { item } = props;
  const { fetchFcn, shownFields, itemMap } = useScheduleView();
  const { scheduleStore, taskStore, habitStore } = useStore();

  const dropdownActions =
    !item.associatedHabit && !item.associatedTask
      ? [
          {
            onClick: () =>
              taskStore.addItem({
                title: item.name,
                schedule: item.id,
                importance: 5,
              }),
            title: "Add to Tasks",
          },
          {
            onClick: () =>
              habitStore.addItem({
                title: item.name,
                schedule: item.id,
              }),
            title: "Add to Habits",
          },
        ]
      : [];

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id"]}
      important={["name"]}
      prices={ScheduleFields.pricesFields}
      FormComponent={ScheduleForm}
      deleteItem={scheduleStore.deleteItem}
      fetchFcn={fetchFcn}
      dropdownActions={dropdownActions}
      itemMap={itemMap}
    />
  );
});

export const ScheduleDashboard = observer(
  (props: {
    date: Date;
    setDate: StateSetter<Date>;
    view: CalendarView;
    setView: StateSetter<CalendarView>;
    range: string;
  }) => {
    const { range, view, date } = props;

    const { scheduleStore } = useStore();

    const items = !["week", "month"].includes(view)
      ? []
      : scheduleStore.items
          .map((s) => s.$view)
          .flatMap((s) =>
            generateCollidingDates(s, {
              startDate: moment(date)
                .subtract(1, "days")
                .startOf("day")
                .toDate(),
              endDate: moment(date).add(1, "days").endOf("day").toDate(),
            }).map((date) => ({
              ...s,
              collidingDate: date,
            }))
          )
          .filter((s) => {
            const m = moment(s.collidingDate);
            if (view === "week")
              return m.isBetween(
                moment(range).startOf("week"),
                moment(range).endOf("week"),
                null,
                "[]"
              );
            if (view === "month") return m.format("YYYY-MM") === range;
            return false;
          })
          .map((s, ind) => ({
            id: ind,
            title: s.name ?? "",
            dateStart: s.collidingDate.toISOString(),
            dateEnd: s.collidingDate.toISOString(),
            dateCompleted: s.collidingDate.toISOString(),
          }));
    return (
      <MyLockedCard isUnlocked>
        <MyCalendar {...props} events={items} noCompletion />
      </MyLockedCard>
    );
  }
);

export const ScheduleCollection = observer(() => {
  const { scheduleStore } = useStore();
  const { pageDetails, PageBar } = useScheduleView();
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");
  const range =
    view === "week"
      ? moment(date).format("YYYY-MM-DD")
      : view === "month"
      ? moment(date).format("YYYY-MM")
      : view === "year"
      ? moment(date).format("YYYY")
      : `${Math.floor(moment(date).year() / 10)}X`;

  const values = {
    date,
    setDate,
    view,
    setView,
    range,
  };

  return (
    <SideBySideView
      SideA={
        <MyGenericCollection
          CardComponent={ScheduleCard}
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={scheduleStore.items}
        />
      }
      SideB={<ScheduleDashboard {...values} />}
      ratio={0.7}
    />
  );
});

export const ScheduleFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new Schedule({}).$view}
      title="Schedule Filters"
      dateFields={[
        ...ScheduleFields.datetimeFields,
        ...ScheduleFields.dateFields,
      ]}
      excludeFields={["id"]}
      relatedFields={[]}
      optionFields={[]}
    />
  );
});

export const ScheduleRow = observer((props: { item: Schedule }) => {
  const { item } = props;
  const { fetchFcn } = useScheduleView();
  const { scheduleStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={ScheduleForm}
      deleteItem={scheduleStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const ScheduleTable = observer(() => {
  const { scheduleStore } = useStore();
  const values = useScheduleView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={scheduleStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <ScheduleRow item={item} />}
      priceFields={ScheduleFields.pricesFields}
      {...values}
    />
  );
});

export const ScheduleView = observer(() => {
  const { scheduleStore, settingStore, taskStore, habitStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<ScheduleInterface, Schedule>(
    settingStore,
    "Schedule",
    new Schedule({})
  );
  const { params, setPageDetails } = values;
  const fetchFcn = async () => {
    const resp = await scheduleStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    const schedIds = resp.data.map((s) => s.id);
    taskStore.fetchAll(`schedule__in=${schedIds.join(",")}`);
    habitStore.fetchAll(`schedule__in=${schedIds.join(",")}`);
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(() => [] satisfies KV<any>[], []);

  const actionModalDefs = [] satisfies ActionModalDef[];

  return (
    <MyGenericView<ScheduleInterface>
      title={title}
      Context={ScheduleViewContext}
      CollectionComponent={ScheduleCollection}
      FormComponent={ScheduleForm}
      FilterComponent={ScheduleFilter}
      actionModalDefs={actionModalDefs}
      TableComponent={ScheduleTable}
      fetchFcn={fetchFcn}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
