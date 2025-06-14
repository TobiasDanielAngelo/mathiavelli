import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { Goal, GoalFields, GoalInterface } from "../../api/GoalStore";
import { useStore } from "../../api/Store";
import { MyGenericFilter } from "../../blueprints/MyGenericComponents/MyGenericFilter";
import { MyGenericForm } from "../../blueprints/MyGenericComponents/MyGenericForm";
import { createGenericViewContext } from "../../blueprints/MyGenericComponents/MyGenericProps";
import { MyGenericRecursiveCard } from "../../blueprints/MyGenericComponents/MyGenericRecursiveCard";
import { MyGenericRow } from "../../blueprints/MyGenericComponents/MyGenericRow";
import { MyGenericTable } from "../../blueprints/MyGenericComponents/MyGenericTable";
import { SideBySideView } from "../../blueprints/SideBySideView";
import {
  getDescendantIds,
  sortAndFilterByIds,
  toOptions,
} from "../../constants/helpers";
import { Field } from "../../constants/interfaces";

export const { Context: GoalViewContext, useGenericView: useGoalView } =
  createGenericViewContext<GoalInterface>();

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
            type: "date",
          },
          {
            name: "dateEnd",
            label: "Date End",
            type: "date",
          },
        ],
        [
          {
            name: "dateCompleted",
            label: "Date Completed",
            type: "date",
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
      storeFns={{
        add: goalStore.addItem,
        update: goalStore.updateItem,
        delete: goalStore.deleteItem,
      }}
      datetimeFields={GoalFields.datetime}
      dateFields={GoalFields.date}
    />
  );
};

export const GoalCard = observer((props: { item: Goal }) => {
  const { item } = props;
  const { fetchFcn, shownFields } = useGoalView();
  const { followUpStore, goalStore } = useStore();

  return (
    <MyGenericRecursiveCard
      item={item}
      shownFields={shownFields}
      important={["title"]}
      body={["description", "dateDuration", "isCancelled"]}
      prices={GoalFields.prices}
      FormComponent={GoalForm}
      deleteItem={followUpStore.deleteItem}
      fetchFcn={fetchFcn}
      items={goalStore.items}
      parentKey={"parentGoal"}
    />
  );
});

export const GoalCollection = observer(() => {
  const { goalStore } = useStore();
  const { pageDetails, PageBar } = useGoalView();

  return (
    <SideBySideView
      SideB={
        <div className="flex flex-col min-h-[85vh]">
          <PageBar />
          <div className="flex-1">
            {sortAndFilterByIds(
              goalStore.items.filter((s) => s.parentGoal == null),
              pageDetails?.ids ?? [],
              (s) => s.id
            ).map((s) => (
              <GoalCard item={s} key={s.id} />
            ))}
          </div>
          <PageBar />
        </div>
      }
      SideA=""
      ratio={0.7}
    />
  );
});

export const GoalFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new Goal({}).$}
      title="Goal Filters"
      dateFields={[...GoalFields.date, ...GoalFields.datetime]}
      excludeFields={["id"]}
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
  const { shownFields, params, setParams, pageDetails, PageBar } =
    useGoalView();

  return (
    <MyGenericTable
      items={goalStore.items}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <GoalRow item={item} />}
    />
  );
});
