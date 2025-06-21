import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  HabitLog,
  HabitLogFields,
  HabitLogInterface,
} from "../../api/HabitLogStore";
import { useStore } from "../../api/Store";
import { MyMultiDropdownSelector } from "../../blueprints";
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
  GraphType,
  MyGenericView,
} from "../../blueprints/MyGenericComponents/MyGenericView";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { toOptions, toTitleCase } from "../../constants/helpers";
import { useLocalStorageState, useVisible } from "../../constants/hooks";
import { Field, PaginatedDetails } from "../../constants/interfaces";

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
    [habitStore.items.length]
  );

  return (
    <MyGenericForm<HabitLogInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="habitLog"
      fields={fields}
      storeFns={{
        add: habitLogStore.addItem,
        update: habitLogStore.updateItem,
        delete: habitLogStore.deleteItem,
      }}
      datetimeFields={HabitLogFields.datetime}
      dateFields={HabitLogFields.date}
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
      header={["dateCreated"]}
      important={["habitName"]}
      prices={HabitLogFields.prices}
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
      dateFields={HabitLogFields.datetime}
      excludeFields={["id"]}
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
  const {
    shownFields,
    params,
    setParams,
    pageDetails,
    PageBar,
    itemMap,
    sortFields,
    setSortFields,
  } = useHabitLogView();

  return (
    <MyGenericTable
      items={habitLogStore.items}
      shownFields={shownFields}
      sortFields={sortFields}
      setSortFields={setSortFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <HabitLogRow item={item} />}
      priceFields={HabitLogFields.prices}
      itemMap={itemMap}
    />
  );
});

export const HabitLogView = observer(() => {
  const { habitLogStore } = useStore();
  const { setVisible1, isVisible, setVisible } = useVisible();
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const [params, setParams] = useSearchParams();
  const objWithFields = new HabitLog({}).$view;
  const [graph, setGraph] = useState<GraphType>("pie");
  const [shownFields, setShownFields] = useLocalStorageState(
    Object.keys(objWithFields) as (keyof HabitLogInterface)[],
    "shownFieldsHabitLog"
  );
  const [sortFields, setSortFields] = useLocalStorageState(
    [] as string[],
    "sortFieldsHabitLog"
  );
  const fetchFcn = async () => {
    const resp = await habitLogStore.fetchAll(params.toString());
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
      name: "Add a HabitLog",
      modal: <HabitLogForm fetchFcn={fetchFcn} setVisible={setVisible1} />,
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
            setShownFields(t as (keyof HabitLogInterface)[])
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
      modal: <HabitLogFilter />,
    },
  ] satisfies ActionModalDef[];

  return (
    <MyGenericView<HabitLogInterface>
      title={title}
      fetchFcn={fetchFcn}
      actionModalDefs={actionModalDefs}
      isVisible={isVisible}
      setVisible={setVisible}
      Context={HabitLogViewContext}
      CollectionComponent={HabitLogCollection}
      TableComponent={HabitLogTable}
      shownFields={shownFields}
      setShownFields={setShownFields}
      sortFields={sortFields}
      setSortFields={setSortFields}
      availableGraphs={["pie", "line"]}
      pageDetails={pageDetails}
      params={params}
      setParams={setParams}
      itemMap={itemMap}
      graph={graph}
      setGraph={setGraph}
    />
  );
});
