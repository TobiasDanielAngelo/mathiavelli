import { observer } from "mobx-react-lite";
import { Habit, HabitFields, HabitInterface } from "../../api/HabitStore";
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

export const { Context: HabitViewContext, useGenericView: useHabitView } =
  createGenericViewContext<HabitInterface>();

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
        [{ name: "dateStart", label: "Date Start", type: "date" }],
        [{ name: "dateEnd", label: "Date End", type: "date" }],
        [{ name: "isArchived", label: "Is Archived", type: "check" }],
        [{ name: "dateCreated", label: "Date Created", type: "datetime" }],
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
      storeFns={{
        add: habitStore.addItem,
        update: habitStore.updateItem,
        delete: habitStore.deleteItem,
      }}
      datetimeFields={HabitFields.datetime}
      dateFields={HabitFields.date}
    />
  );
};

export const HabitCard = observer((props: { item: Habit }) => {
  const { item } = props;
  const { fetchFcn, shownFields } = useHabitView();
  const { habitStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id"]}
      important={["title"]}
      body={[
        "description",
        "dateCreated",
        "dateEnd",
        "dateStart",
        "goalName",
        "scheduleName",
        "isArchived",
        "thresholdPercent",
      ]}
      prices={HabitFields.prices}
      FormComponent={HabitForm}
      deleteItem={habitStore.deleteItem}
      fetchFcn={fetchFcn}
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
        <div className="flex flex-col min-h-[85vh]">
          <PageBar />
          <div className="flex-1">
            {sortAndFilterByIds(
              habitStore.items,
              pageDetails?.ids ?? [],
              (s) => s.id
            ).map((s) => (
              <HabitCard item={s} key={s.id} />
            ))}
          </div>
          <PageBar />
        </div>
      }
      SideB={<HabitDashboard />}
      ratio={0.7}
    />
  );
});

export const HabitFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new Habit({}).$}
      title="Habit Filters"
      dateFields={HabitFields.datetime}
      excludeFields={["id"]}
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
  const { shownFields, params, setParams, pageDetails, PageBar, itemMap } =
    useHabitView();

  return (
    <MyGenericTable
      items={habitStore.items}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <HabitRow item={item} />}
      priceFields={HabitFields.prices}
      itemMap={itemMap}
    />
  );
});

export const HabitView = observer(() => {
  const { habitStore } = useStore();
  const { setVisible1, isVisible, setVisible } = useVisible();
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const [params, setParams] = useSearchParams();
  const objWithFields = new Habit({}).$;
  const [shownFields, setShownFields] = useLocalStorageState(
    Object.keys(objWithFields) as (keyof HabitInterface)[],
    "shownFieldsHabit"
  );
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
      label: "NEW",
      name: "Add a Habit",
      modal: <HabitForm fetchFcn={fetchFcn} setVisible={setVisible1} />,
    },
    {
      icon: "ViewList",
      label: "FIELDS",
      name: "Show Fields",
      modal: (
        <MyMultiDropdownSelector
          label="Fields"
          value={shownFields}
          onChangeValue={(t) => setShownFields(t as (keyof HabitInterface)[])}
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
      modal: <HabitFilter />,
    },
  ] satisfies ActionModalDef[];

  return (
    <MyGenericView<HabitInterface>
      fetchFcn={fetchFcn}
      actionModalDefs={actionModalDefs}
      isVisible={isVisible}
      setVisible={setVisible}
      Context={HabitViewContext}
      CollectionComponent={HabitCollection}
      TableComponent={HabitTable}
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
