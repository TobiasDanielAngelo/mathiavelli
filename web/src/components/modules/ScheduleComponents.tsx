import { observer } from "mobx-react-lite";
import {
  FREQ_CHOICES,
  Schedule,
  ScheduleFields,
  ScheduleInterface,
  WEEKDAY_CHOICES,
} from "../../api/ScheduleStore";
import { useStore } from "../../api/Store";
import { MyGenericCard } from "../../blueprints/MyGenericComponents/MyGenericCard";
import { MyGenericFilter } from "../../blueprints/MyGenericComponents/MyGenericFilter";
import { MyGenericForm } from "../../blueprints/MyGenericComponents/MyGenericForm";
import { createGenericViewContext } from "../../blueprints/MyGenericComponents/MyGenericProps";
import { MyGenericRow } from "../../blueprints/MyGenericComponents/MyGenericRow";
import { MyGenericTable } from "../../blueprints/MyGenericComponents/MyGenericTable";
import {
  ActionModalDef,
  MyGenericView,
} from "../../blueprints/MyGenericComponents/MyGenericView";
import { SideBySideView } from "../../blueprints/SideBySideView";
import {
  generateCollidingDates,
  range,
  sortAndFilterByIds,
  toOptions,
  toTitleCase,
} from "../../constants/helpers";
import { Field, PaginatedDetails } from "../../constants/interfaces";
import { MyMultiDropdownSelector } from "../../blueprints";
import { useLocalStorageState, useVisible } from "../../constants/hooks";
import { useSearchParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { KV } from "../../blueprints/ItemDetails";

export const { Context: ScheduleViewContext, useGenericView: useScheduleView } =
  createGenericViewContext<ScheduleInterface>();

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
            label: "Freq",
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
            name: "bySetPos",
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
            name: "collidings",
            label: "Colliding Dates",
            type: "function",
            function: (t) => generateCollidingDates(t).join("\n"),
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
      storeFns={{
        add: scheduleStore.addItem,
        update: scheduleStore.updateItem,
        delete: scheduleStore.deleteItem,
      }}
      datetimeFields={ScheduleFields.datetime}
      dateFields={ScheduleFields.date}
      timeFields={ScheduleFields.time}
    />
  );
};

export const ScheduleCard = observer((props: { item: Schedule }) => {
  const { item } = props;
  const { fetchFcn, shownFields } = useScheduleView();
  const { scheduleStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id"]}
      important={["name"]}
      body={[
        "byHour",
        "byMinute",
        "byMonth",
        "byMonthDay",
        "bySecond",
        "bySetPos",
        "byWeekDay",
        "byWeekNo",
        "count",
        "startDate",
        "endDate",
        "startTime",
        "endTime",
        "freqName",
        "interval",
        "weekStartName",
        "collidingDates",
      ]}
      prices={ScheduleFields.prices}
      FormComponent={ScheduleForm}
      deleteItem={scheduleStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const ScheduleDashboard = observer(() => {
  return <></>;
});

export const ScheduleCollection = observer(() => {
  const { scheduleStore } = useStore();
  const { pageDetails, PageBar } = useScheduleView();

  return (
    <SideBySideView
      SideA={
        <div className="flex flex-col min-h-[85vh]">
          <PageBar />
          <div className="flex-1">
            {sortAndFilterByIds(
              scheduleStore.items,
              pageDetails?.ids ?? [],
              (s) => s.id
            ).map((s) => (
              <ScheduleCard item={s} key={s.id} />
            ))}
          </div>
          <PageBar />
        </div>
      }
      SideB={<ScheduleDashboard />}
      ratio={0.7}
    />
  );
});

export const ScheduleFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new Schedule({}).$view}
      title="Schedule Filters"
      dateFields={ScheduleFields.datetime}
      excludeFields={["id"]}
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
  const { shownFields, params, setParams, pageDetails, PageBar, itemMap } =
    useScheduleView();

  return (
    <MyGenericTable
      items={scheduleStore.items}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <ScheduleRow item={item} />}
      priceFields={ScheduleFields.prices}
      itemMap={itemMap}
    />
  );
});

export const ScheduleView = observer(() => {
  const { scheduleStore } = useStore();
  const { setVisible1, isVisible, setVisible } = useVisible();
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const [params, setParams] = useSearchParams();
  const objWithFields = new Schedule({}).$view;
  const [shownFields, setShownFields] = useLocalStorageState(
    Object.keys(objWithFields) as (keyof ScheduleInterface)[],
    "shownFieldsSchedule"
  );
  const fetchFcn = async () => {
    const resp = await scheduleStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(() => [] satisfies KV<any>[], []);

  const actionModalDefs = [
    {
      icon: "NoteAdd",
      label: "NEW",
      name: "Add a Schedule",
      modal: <ScheduleForm fetchFcn={fetchFcn} setVisible={setVisible1} />,
    },
    {
      icon: "ViewList",
      label: "FIELDS",
      name: "Show Fields",
      modal: (
        <MyMultiDropdownSelector
          label="Fields"
          value={shownFields}
          onChangeValue={(t) =>
            setShownFields(t as (keyof ScheduleInterface)[])
          }
          options={Object.keys(objWithFields).map((s) => ({
            id: s,
            name: toTitleCase(s),
          }))}
          relative
          open
        />
      ),
    },
    {
      icon: "FilterListAlt",
      label: "FILTERS",
      name: "Filters",
      modal: <ScheduleFilter />,
    },
  ] satisfies ActionModalDef[];

  return (
    <MyGenericView<ScheduleInterface>
      fetchFcn={fetchFcn}
      actionModalDefs={actionModalDefs}
      isVisible={isVisible}
      setVisible={setVisible}
      Context={ScheduleViewContext}
      CollectionComponent={ScheduleCollection}
      TableComponent={ScheduleTable}
      shownFields={shownFields}
      setShownFields={setShownFields}
      availableGraphs={["pie", "line"]}
      pageDetails={pageDetails}
      params={params}
      setParams={setParams}
      itemMap={itemMap}
    />
  );
});
