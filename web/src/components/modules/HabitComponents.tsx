import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { Habit, HabitInterface } from "../../api/HabitStore";
import { useStore } from "../../api/Store";
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
import { SideBySideView } from "../../blueprints/SideBySideView";
import { toOptions } from "../../constants/helpers";
import { useVisible } from "../../constants/hooks";
import { ActionModalDef, Field, KV } from "../../constants/interfaces";
import { ScheduleForm } from "./ScheduleComponents";

export const { Context: HabitViewContext, useGenericView: useHabitView } =
  createGenericViewContext<HabitInterface>();

const title = "Habits";

export const HabitIdMap = {} as const;

export const HabitForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: Habit;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { habitStore, goalStore, scheduleStore } = useStore();

  const fields = useMemo(
    () =>
      [
        [{ name: "title", label: "Title", type: "text" }],
        [{ name: "description", label: "Description", type: "text" }],
        [{ name: "points", label: "Points (1 to 3)", type: "text" }],
        [
          {
            name: "goal",
            label: "Goal",
            type: "select",
            options: toOptions(goalStore.items, "title"),
          },
        ],
        [
          {
            name: "schedule",
            label: "Schedule",
            type: "select",
            options: toOptions(scheduleStore.items, "name"),
          },
        ],
        [
          {
            name: "thresholdPercent",
            label: "Threshold Percent",
            type: "text",
          },
        ],
        [{ name: "dateStart", label: "Date Start", type: "datetime" }],
        [{ name: "dateEnd", label: "Date End", type: "datetime" }],
        [{ name: "isArchived", label: "Is Archived", type: "check" }],
      ] satisfies Field[][],
    [goalStore.items.length, scheduleStore.items.length]
  );

  return (
    <MyGenericForm<HabitInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="habit"
      fields={fields}
      store={habitStore}
      datetimeFields={habitStore.datetimeFields}
      dateFields={habitStore.dateFields}
      timeFields={habitStore.timeFields}
    />
  );
};

export const HabitCard = observer((props: { item: Habit }) => {
  const { item } = props;
  const { fetchFcn, shownFields, itemMap, related } = useHabitView();
  const { habitStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id"]}
      important={["title"]}
      prices={habitStore.priceFields}
      FormComponent={HabitForm}
      deleteItem={habitStore.deleteItem}
      fetchFcn={fetchFcn}
      itemMap={itemMap}
      related={related}
    />
  );
});

export const HabitDashboard = observer(() => {
  return <></>;
});

export const HabitCollection = observer(() => {
  const { habitStore } = useStore();
  const { pageDetails, PageBar } = useHabitView();

  return (
    <SideBySideView
      SideA={
        <MyGenericCollection
          CardComponent={HabitCard}
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={habitStore.items}
        />
      }
      SideB={<HabitDashboard />}
      ratio={0.7}
    />
  );
});

export const HabitFilter = observer(() => {
  const { habitStore } = useStore();
  return (
    <MyGenericFilter
      view={new Habit({}).$view}
      title="Habit Filters"
      dateFields={[...habitStore.datetimeFields, ...habitStore.dateFields]}
      relatedFields={habitStore.relatedFields}
      optionFields={habitStore.optionFields}
    />
  );
});

export const HabitRow = observer((props: { item: Habit }) => {
  const { item } = props;
  const { fetchFcn } = useHabitView();
  const { habitStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={HabitForm}
      deleteItem={habitStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const HabitTable = observer(() => {
  const { habitStore } = useStore();
  const values = useHabitView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={habitStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <HabitRow item={item} />}
      priceFields={habitStore.priceFields}
      {...values}
    />
  );
});

export const HabitView = observer(() => {
  const { habitStore, settingStore } = useStore();
  const { isVisible, setVisible, setVisible4 } = useVisible();
  const values = useViewValues<HabitInterface, Habit>(
    settingStore,
    "Habit",
    new Habit({})
  );
  const { params, setPageDetails } = values;
  const fetchFcn = async () => {
    const resp = await habitStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(() => [] satisfies KV<any>[], []);

  const actionModalDefs = [
    {
      icon: "NoteAdd",
      label: "SCHED",
      name: "Add a Schedule",
      modal: <ScheduleForm setVisible={setVisible4} />,
    },
  ] satisfies ActionModalDef[];

  return (
    <MyGenericView<HabitInterface>
      title={title}
      Context={HabitViewContext}
      CollectionComponent={HabitCollection}
      FormComponent={HabitForm}
      FilterComponent={HabitFilter}
      actionModalDefs={actionModalDefs}
      TableComponent={HabitTable}
      related={habitStore.related}
      fetchFcn={fetchFcn}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
