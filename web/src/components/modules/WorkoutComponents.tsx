import { observer } from "mobx-react-lite";
import {
  Workout,
  WORKOUT_CATEGORY_CHOICES,
  WorkoutFields,
  WorkoutInterface,
} from "../../api/WorkoutStore";
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

export const { Context: WorkoutViewContext, useGenericView: useWorkoutView } =
  createGenericViewContext<WorkoutInterface>();

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
        <div className="flex flex-col min-h-[85vh]">
          <PageBar />
          <div className="flex-1">
            {sortAndFilterByIds(
              workoutStore.items,
              pageDetails?.ids ?? [],
              (s) => s.id
            ).map((s) => (
              <WorkoutCard item={s} key={s.id} />
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
  const { shownFields, params, setParams, pageDetails, PageBar, itemMap } =
    useWorkoutView();

  return (
    <MyGenericTable
      items={workoutStore.items}
      shownFields={shownFields}
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
      fetchFcn={fetchFcn}
      actionModalDefs={actionModalDefs}
      isVisible={isVisible}
      setVisible={setVisible}
      Context={WorkoutViewContext}
      CollectionComponent={WorkoutCollection}
      TableComponent={WorkoutTable}
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
