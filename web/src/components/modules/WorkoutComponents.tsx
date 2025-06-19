import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useStore } from "../../api/Store";
import {
  Workout,
  WORKOUT_CATEGORY_CHOICES,
  WorkoutFields,
  WorkoutInterface,
} from "../../api/WorkoutStore";
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
  MyGenericView,
} from "../../blueprints/MyGenericComponents/MyGenericView";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { toOptions, toTitleCase } from "../../constants/helpers";
import { useLocalStorageState, useVisible } from "../../constants/hooks";
import { Field, PaginatedDetails } from "../../constants/interfaces";

export const { Context: WorkoutViewContext, useGenericView: useWorkoutView } =
  createGenericViewContext<WorkoutInterface>();

const title = "Workouts";

export const WorkoutIdMap = {} as const;

export const WorkoutForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: Workout;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { workoutStore } = useStore();

  const fields = useMemo(
    () =>
      [
        [{ name: "name", label: "Name", type: "text" }],
        [
          {
            name: "category",
            label: "Category",
            type: "select",
            options: toOptions(WORKOUT_CATEGORY_CHOICES),
          },
        ],
        [{ name: "durationMinutes", label: "Duration Minutes", type: "text" }],
        [{ name: "caloriesBurned", label: "Calories Burned", type: "text" }],
        [{ name: "date", label: "Date", type: "datetime" }],
      ] satisfies Field[][],
    []
  );

  return (
    <MyGenericForm<WorkoutInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="workout"
      fields={fields}
      storeFns={{
        add: workoutStore.addItem,
        update: workoutStore.updateItem,
        delete: workoutStore.deleteItem,
      }}
      datetimeFields={WorkoutFields.datetime}
      dateFields={WorkoutFields.date}
    />
  );
};

export const WorkoutCard = observer((props: { item: Workout }) => {
  const { item } = props;
  const { fetchFcn, shownFields } = useWorkoutView();
  const { workoutStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id"]}
      important={["name"]}
      prices={WorkoutFields.prices}
      FormComponent={WorkoutForm}
      deleteItem={workoutStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const WorkoutCollection = observer(() => {
  const { workoutStore } = useStore();
  const { pageDetails, PageBar } = useWorkoutView();

  return (
    <SideBySideView
      SideA={
        <MyGenericCollection
          CardComponent={WorkoutCard}
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={workoutStore.items}
        />
      }
      SideB=""
      ratio={0.7}
    />
  );
});

export const WorkoutFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new Workout({}).$view}
      title="Workout Filters"
      dateFields={WorkoutFields.datetime}
      excludeFields={["id"]}
    />
  );
});

export const WorkoutRow = observer((props: { item: Workout }) => {
  const { item } = props;
  const { fetchFcn } = useWorkoutView();
  const { workoutStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={WorkoutForm}
      deleteItem={workoutStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const WorkoutTable = observer(() => {
  const { workoutStore } = useStore();
  const {
    shownFields,
    params,
    setParams,
    pageDetails,
    PageBar,
    itemMap,
    sortFields,
    setSortFields,
  } = useWorkoutView();

  return (
    <MyGenericTable
      items={workoutStore.items}
      shownFields={shownFields}
      sortFields={sortFields}
      setSortFields={setSortFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <WorkoutRow item={item} />}
      priceFields={WorkoutFields.prices}
      itemMap={itemMap}
    />
  );
});

export const WorkoutView = observer(() => {
  const { workoutStore } = useStore();
  const { setVisible1, isVisible, setVisible } = useVisible();
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const [params, setParams] = useSearchParams();
  const objWithFields = new Workout({}).$;
  const [shownFields, setShownFields] = useLocalStorageState(
    Object.keys(objWithFields) as (keyof WorkoutInterface)[],
    "shownFieldsWorkout"
  );
  const [sortFields, setSortFields] = useLocalStorageState(
    [] as string[],
    "sortFieldsWorkout"
  );
  const fetchFcn = async () => {
    const resp = await workoutStore.fetchAll(params.toString());
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
      name: "Add a Workout",
      modal: <WorkoutForm fetchFcn={fetchFcn} setVisible={setVisible1} />,
    },
    {
      icon: "ViewList",
      label: "FIELDS",
      name: "Show Fields",
      modal: (
        <MyMultiDropdownSelector
          label="Fields"
          value={shownFields}
          onChangeValue={(t) => setShownFields(t as (keyof WorkoutInterface)[])}
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
      modal: <WorkoutFilter />,
    },
  ] satisfies ActionModalDef[];

  return (
    <MyGenericView<WorkoutInterface>
      title={title}
      fetchFcn={fetchFcn}
      actionModalDefs={actionModalDefs}
      isVisible={isVisible}
      setVisible={setVisible}
      Context={WorkoutViewContext}
      CollectionComponent={WorkoutCollection}
      TableComponent={WorkoutTable}
      shownFields={shownFields}
      setShownFields={setShownFields}
      sortFields={sortFields}
      setSortFields={setSortFields}
      availableGraphs={["pie", "line"]}
      pageDetails={pageDetails}
      params={params}
      setParams={setParams}
      itemMap={itemMap}
    />
  );
});
