import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { Goal, GoalFields, GoalInterface } from "../../api/GoalStore";
import { useStore } from "../../api/Store";
import { KV, ActionModalDef } from "../../constants/interfaces";
import { MyGenericCollection } from "../../blueprints/MyGenericComponents/MyGenericCollection";
import { MyGenericFilter } from "../../blueprints/MyGenericComponents/MyGenericFilter";
import { MyGenericForm } from "../../blueprints/MyGenericComponents/MyGenericForm";
import { createGenericViewContext } from "../../blueprints/MyGenericComponents/MyGenericProps";
import { MyGenericRecursiveCard } from "../../blueprints/MyGenericComponents/MyGenericRecursiveCard";
import { MyGenericRow } from "../../blueprints/MyGenericComponents/MyGenericRow";
import { MyGenericTable } from "../../blueprints/MyGenericComponents/MyGenericTable";
import {
  MyGenericView,
  useViewValues,
} from "../../blueprints/MyGenericComponents/MyGenericView";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { getDescendantIds, toOptions } from "../../constants/helpers";
import { useVisible } from "../../constants/hooks";
import { Field } from "../../constants/interfaces";
import { MyEisenhowerChart } from "../../blueprints/MyCharts/MyEisenhowerChart";

export const { Context: GoalViewContext, useGenericView: useGoalView } =
  createGenericViewContext<GoalInterface>();

const title = "Goals";

export const GoalIdMap = {} as const;

export const GoalForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: Goal;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { goalStore } = useStore();

  const fields = useMemo(
    () =>
      [
        [
          {
            name: "title",
            label: "Title",
            type: "text",
          },
        ],
        [
          {
            name: "description",
            label: "Description",
            type: "textarea",
          },
        ],
        [
          {
            name: "parentGoal",
            label: "Parent Goal",
            type: "select",
            options: toOptions(
              goalStore.items.filter(
                (s) =>
                  s.id !== item?.id &&
                  !getDescendantIds(goalStore.items, item?.id ?? -1).includes(
                    s.id
                  )
              ),
              "title"
            ),
          },
        ],
        [
          {
            name: "dateStart",
            label: "Date Start",
            type: "datetime",
          },
          {
            name: "dateEnd",
            label: "Date End",
            type: "datetime",
          },
        ],
        [
          {
            name: "isArchived",
            label: "Is Archived?",
            type: "check",
          },
        ],
      ] satisfies Field[][],
    [goalStore.items.length, item?.id]
  );

  return (
    <MyGenericForm<GoalInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="goal"
      fields={fields}
      store={goalStore}
      datetimeFields={GoalFields.datetimeFields}
      dateFields={GoalFields.dateFields}
      timeFields={GoalFields.timeFields}
    />
  );
};

export const GoalDashboard = observer(() => {
  const { goalStore } = useStore();
  const goals = goalStore.items
    .filter((s) => !s.dateCompleted && !s.isArchived)
    .map((s) => ({
      id: s.id,
      name: s.title,
      importance: 10,
      dueDate: new Date(s.dateEnd),
    }));

  return (
    <>
      <MyEisenhowerChart items={goals} title="Goals" />
    </>
  );
});

export const GoalCard = observer((props: { item: Goal }) => {
  const { item } = props;
  const { fetchFcn, shownFields, itemMap } = useGoalView();
  const { goalStore } = useStore();

  return (
    <MyGenericRecursiveCard
      item={item}
      shownFields={shownFields}
      header={["id"]}
      important={["title"]}
      prices={GoalFields.pricesFields}
      FormComponent={GoalForm}
      deleteItem={goalStore.deleteItem}
      fetchFcn={fetchFcn}
      items={goalStore.items}
      parentKey={"parentGoal"}
      itemMap={itemMap}
      border
    />
  );
});

export const GoalCollection = observer(() => {
  const { goalStore } = useStore();
  const { pageDetails, PageBar } = useGoalView();

  return (
    <SideBySideView
      SideB={
        <MyGenericCollection
          CardComponent={GoalCard}
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={goalStore.items.filter((s) => s.parentGoal == null)}
        />
      }
      SideA={<GoalDashboard />}
      ratio={0.7}
    />
  );
});

export const GoalFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new Goal({}).$view}
      title="Goal Filters"
      dateFields={[...GoalFields.dateFields, ...GoalFields.datetimeFields]}
      excludeFields={["id"]}
      relatedFields={[]}
      optionFields={[]}
    />
  );
});

export const GoalRow = observer((props: { item: Goal }) => {
  const { item } = props;
  const { fetchFcn } = useGoalView();
  const { goalStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={GoalForm}
      deleteItem={goalStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const GoalTable = observer(() => {
  const { goalStore } = useStore();
  const values = useGoalView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={goalStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <GoalRow item={item} />}
      priceFields={GoalFields.pricesFields}
      {...values}
    />
  );
});

export const GoalView = observer(() => {
  const { goalStore, settingStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<GoalInterface, Goal>(
    settingStore,
    "Goal",
    new Goal({})
  );
  const { params, setPageDetails } = values;
  const fetchFcn = async () => {
    const resp = await goalStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(
    () =>
      [
        {
          key: "parentGoal",
          values: goalStore.items,
          label: "title",
        },
      ] satisfies KV<any>[],
    [goalStore.items.length]
  );

  const actionModalDefs = [] satisfies ActionModalDef[];

  return (
    <MyGenericView<GoalInterface>
      title={title}
      Context={GoalViewContext}
      CollectionComponent={GoalCollection}
      FormComponent={GoalForm}
      FilterComponent={GoalFilter}
      actionModalDefs={actionModalDefs}
      TableComponent={GoalTable}
      fetchFcn={fetchFcn}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
