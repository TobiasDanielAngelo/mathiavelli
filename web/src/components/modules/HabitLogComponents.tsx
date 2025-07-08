import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import {
  HabitLog,
  HabitLogFields,
  HabitLogInterface,
} from "../../api/HabitLogStore";
import { useStore } from "../../api/Store";
import { KV } from "../../blueprints/ItemDetails";
import { MyGenericCard } from "../../blueprints/MyGenericComponents/MyGenericCard";
import { MyGenericCollection } from "../../blueprints/MyGenericComponents/MyGenericCollection";
import { MyGenericFilter } from "../../blueprints/MyGenericComponents/MyGenericFilter";
import { MyGenericForm } from "../../blueprints/MyGenericComponents/MyGenericForm";
import { createGenericViewContext } from "../../blueprints/MyGenericComponents/MyGenericProps";
import { MyGenericRow } from "../../blueprints/MyGenericComponents/MyGenericRow";
import { MyGenericTable } from "../../blueprints/MyGenericComponents/MyGenericTable";
import {
  ActionModalDef,
  MyGenericView,
  useViewValues,
} from "../../blueprints/MyGenericComponents/MyGenericView";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { toOptions } from "../../constants/helpers";
import { useVisible } from "../../constants/hooks";
import { Field } from "../../constants/interfaces";

export const { Context: HabitLogViewContext, useGenericView: useHabitLogView } =
  createGenericViewContext<HabitLogInterface>();

const title = "Habit Logs";

export const HabitLogIdMap = {} as const;

export const HabitLogForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: HabitLog;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { habitLogStore, habitStore } = useStore();

  const fields = useMemo(
    () =>
      [
        [
          {
            name: "habit",
            label: "Habit",
            type: "select",
            options: toOptions(habitStore.items, "title"),
          },
        ],
        [{ name: "dateCreated", label: "Created At", type: "datetime" }],
      ] satisfies Field[][],
    [habitStore.items]
  );

  return (
    <MyGenericForm<HabitLogInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="habitLog"
      fields={fields}
      store={habitLogStore}
      datetimeFields={HabitLogFields.datetimeFields}
      dateFields={HabitLogFields.dateFields}
      timeFields={HabitLogFields.timeFields}
    />
  );
};

export const HabitLogCard = observer((props: { item: HabitLog }) => {
  const { item } = props;
  const { fetchFcn, shownFields } = useHabitLogView();
  const { habitLogStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id", "dateCreated"]}
      important={["habitName"]}
      prices={HabitLogFields.pricesFields}
      FormComponent={HabitLogForm}
      deleteItem={habitLogStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const HabitLogDashboard = observer(() => {
  return <></>;
});

export const HabitLogCollection = observer(() => {
  const { habitLogStore } = useStore();
  const { pageDetails, PageBar } = useHabitLogView();

  return (
    <SideBySideView
      SideA={
        <MyGenericCollection
          CardComponent={HabitLogCard}
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={habitLogStore.items}
        />
      }
      SideB={<HabitLogDashboard />}
      ratio={0.7}
    />
  );
});

export const HabitLogFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new HabitLog({}).$}
      title="HabitLog Filters"
      dateFields={[
        ...HabitLogFields.datetimeFields,
        ...HabitLogFields.dateFields,
      ]}
      excludeFields={["id"]}
      relatedFields={[]}
      optionFields={[]}
    />
  );
});

export const HabitLogRow = observer((props: { item: HabitLog }) => {
  const { item } = props;
  const { fetchFcn } = useHabitLogView();
  const { habitLogStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={HabitLogForm}
      deleteItem={habitLogStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const HabitLogTable = observer(() => {
  const { habitLogStore } = useStore();
  const values = useHabitLogView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={habitLogStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <HabitLogRow item={item} />}
      priceFields={HabitLogFields.pricesFields}
      {...values}
    />
  );
});

export const HabitLogView = observer(() => {
  const { habitLogStore, habitStore, settingStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<HabitLogInterface, HabitLog>(
    settingStore,
    "HabitLog",
    new HabitLog({})
  );
  const { params, setPageDetails } = values;
  const fetchFcn = async () => {
    const resp = await habitLogStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
    const habits = resp.data.map((s) => s.habit);
    if (habits) {
      habitStore.fetchAll(`id__in=${habits.join(",")}`);
    }
  };

  const itemMap = useMemo(() => [] satisfies KV<any>[], []);

  const actionModalDefs = [] satisfies ActionModalDef[];

  return (
    <MyGenericView<HabitLogInterface>
      title={title}
      Context={HabitLogViewContext}
      CollectionComponent={HabitLogCollection}
      FormComponent={HabitLogForm}
      FilterComponent={HabitLogFilter}
      actionModalDefs={actionModalDefs}
      TableComponent={HabitLogTable}
      fetchFcn={fetchFcn}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
