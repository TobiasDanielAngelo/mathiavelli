import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Goal, GoalFields, GoalInterface } from "../../api/GoalStore";
import { useStore } from "../../api/Store";
import { MyMultiDropdownSelector } from "../../blueprints";
import { KV } from "../../blueprints/ItemDetails";
import { MyGenericCollection } from "../../blueprints/MyGenericComponents/MyGenericCollection";
import { MyGenericFilter } from "../../blueprints/MyGenericComponents/MyGenericFilter";
import { MyGenericForm } from "../../blueprints/MyGenericComponents/MyGenericForm";
import { createGenericViewContext } from "../../blueprints/MyGenericComponents/MyGenericProps";
import { MyGenericRecursiveCard } from "../../blueprints/MyGenericComponents/MyGenericRecursiveCard";
import { MyGenericRow } from "../../blueprints/MyGenericComponents/MyGenericRow";
import { MyGenericTable } from "../../blueprints/MyGenericComponents/MyGenericTable";
import {
  ActionModalDef,
  MyGenericView,
} from "../../blueprints/MyGenericComponents/MyGenericView";
import { SideBySideView } from "../../blueprints/SideBySideView";
import {
  getDescendantIds,
  toOptions,
  toTitleCase,
} from "../../constants/helpers";
import { useLocalStorageState, useVisible } from "../../constants/hooks";
import { Field, PaginatedDetails } from "../../constants/interfaces";

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
      body={["description", "dateDuration", "isArchived", "dateCompleted"]}
      prices={GoalFields.prices}
      FormComponent={GoalForm}
      deleteItem={followUpStore.deleteItem}
      fetchFcn={fetchFcn}
      items={goalStore.items}
      parentKey={"parentGoal"}
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
      SideA=""
      ratio={0.7}
    />
  );
});

export const GoalFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new Goal({}).$view}
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
  const {
    shownFields,
    params,
    setParams,
    pageDetails,
    PageBar,
    itemMap,
    sortFields,
    setSortFields,
  } = useGoalView();

  return (
    <MyGenericTable
      items={goalStore.items}
      shownFields={shownFields}
      sortFields={sortFields}
      setSortFields={setSortFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <GoalRow item={item} />}
      priceFields={GoalFields.prices}
      itemMap={itemMap}
    />
  );
});

export const GoalView = observer(() => {
  const { goalStore } = useStore();
  const { setVisible1, isVisible, setVisible } = useVisible();
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const [params, setParams] = useSearchParams();
  const objWithFields = new Goal({}).$view;
  const [shownFields, setShownFields] = useLocalStorageState(
    Object.keys(objWithFields) as (keyof GoalInterface)[],
    "shownFieldsGoal"
  );
  const [sortFields, setSortFields] = useLocalStorageState(
    [] as string[],
    "sortFieldsGoal"
  );
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

  const actionModalDefs = [
    {
      icon: "NoteAdd",
      label: "NEW",
      name: "Add a Goal",
      modal: <GoalForm fetchFcn={fetchFcn} setVisible={setVisible1} />,
    },
    {
      icon: "ViewList",
      label: "FIELDS",
      name: "Show Fields",
      modal: (
        <MyMultiDropdownSelector
          label="Fields"
          value={shownFields}
          onChangeValue={(t) => setShownFields(t as (keyof GoalInterface)[])}
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
      modal: <GoalFilter />,
    },
  ] satisfies ActionModalDef[];

  return (
    <MyGenericView<GoalInterface>
      title={title}
      fetchFcn={fetchFcn}
      actionModalDefs={actionModalDefs}
      isVisible={isVisible}
      setVisible={setVisible}
      Context={GoalViewContext}
      CollectionComponent={GoalCollection}
      TableComponent={GoalTable}
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
