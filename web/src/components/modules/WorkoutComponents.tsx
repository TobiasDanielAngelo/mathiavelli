import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { useStore } from "../../api/Store";
import {
  Workout,
  WORKOUT_CATEGORY_CHOICES,
  WorkoutInterface,
} from "../../api/WorkoutStore";
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
      store={workoutStore}
      datetimeFields={workoutStore.datetimeFields}
      dateFields={workoutStore.dateFields}
      timeFields={workoutStore.timeFields}
    />
  );
};

export const WorkoutCard = observer((props: { item: Workout }) => {
  const { item } = props;
  const { fetchFcn, shownFields, itemMap, related } = useWorkoutView();
  const { workoutStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id"]}
      important={["name"]}
      prices={workoutStore.priceFields}
      FormComponent={WorkoutForm}
      deleteItem={workoutStore.deleteItem}
      fetchFcn={fetchFcn}
      itemMap={itemMap}
      related={related}
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
  const { workoutStore } = useStore();
  return (
    <MyGenericFilter
      view={new Workout({}).$view}
      title="Workout Filters"
      dateFields={[...workoutStore.datetimeFields, ...workoutStore.dateFields]}
      relatedFields={workoutStore.relatedFields}
      optionFields={workoutStore.optionFields}
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
  const values = useWorkoutView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={workoutStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <WorkoutRow item={item} />}
      priceFields={workoutStore.priceFields}
      {...values}
    />
  );
});

export const WorkoutView = observer(() => {
  const { workoutStore, settingStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<WorkoutInterface, Workout>(
    settingStore,
    "Workout",
    new Workout({})
  );
  const { params, setPageDetails } = values;
  const fetchFcn = async () => {
    const resp = await workoutStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(() => [] satisfies KV<any>[], []);

  const actionModalDefs = [] satisfies ActionModalDef[];

  return (
    <MyGenericView<WorkoutInterface>
      title={title}
      Context={WorkoutViewContext}
      CollectionComponent={WorkoutCollection}
      FormComponent={WorkoutForm}
      FilterComponent={WorkoutFilter}
      actionModalDefs={actionModalDefs}
      TableComponent={WorkoutTable}
      related={workoutStore.related}
      fetchFcn={fetchFcn}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
