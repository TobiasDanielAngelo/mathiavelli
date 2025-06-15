import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useStore } from "../../api/Store";
import {
  FREQUENCY_CHOICES,
  Task,
  TaskFields,
  TaskInterface,
} from "../../api/TaskStore";
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

export const { Context: TaskViewContext, useGenericView: useTaskView } =
  createGenericViewContext<TaskInterface>();

export const TaskIdMap = {} as const;

export const TaskForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: Task;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { taskStore, goalStore } = useStore();

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
            name: "goal",
            label: "Goal",
            type: "select",
            options: toOptions(goalStore.items, "title"),
          },
        ],
        [
          {
            name: "isCompleted",
            label: "Complete?",
            type: "check",
          },
          {
            name: "isCancelled",
            label: "Cancel?",
            type: "check",
          },
          {
            name: "repeat",
            label: "Frequency",
            type: "select",
            options: toOptions(FREQUENCY_CHOICES),
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
            name: "dueDate",
            label: "Due Date",
            type: "date",
          },
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
    <MyGenericForm<TaskInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="task"
      fields={fields}
      storeFns={{
        add: taskStore.addItem,
        update: taskStore.updateItem,
        delete: taskStore.deleteItem,
      }}
      datetimeFields={TaskFields.datetime}
    />
  );
};

export const TaskCard = observer((props: { item: Task }) => {
  const { item } = props;
  const { fetchFcn, shownFields } = useTaskView();
  const { taskStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["dueDate"]}
      important={["title"]}
      body={[
        "description",
        "dateStart",
        "dateEnd",
        "isCancelled",
        "isCompleted",
        "goalTitle",
        "repeatName",
        "dateCompleted",
        "dateDuration",
      ]}
      prices={TaskFields.prices}
      FormComponent={TaskForm}
      deleteItem={taskStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const TaskCollection = observer(() => {
  const { taskStore } = useStore();
  const { pageDetails, PageBar } = useTaskView();

  return (
    <SideBySideView
      SideA={
        <MyGenericCollection
          CardComponent={TaskCard}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={taskStore.items}
        />
      }
      SideB=""
      ratio={0.7}
    />
  );
});

export const TaskFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new Task({}).$view}
      title="Task Filters"
      dateFields={TaskFields.datetime}
      excludeFields={["id"]}
    />
  );
});

export const TaskRow = observer((props: { item: Task }) => {
  const { item } = props;
  const { fetchFcn } = useTaskView();
  const { taskStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={TaskForm}
      deleteItem={taskStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const TaskTable = observer(() => {
  const { taskStore } = useStore();
  const { shownFields, params, setParams, pageDetails, PageBar, itemMap } =
    useTaskView();

  return (
    <MyGenericTable
      items={taskStore.items}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <TaskRow item={item} />}
      priceFields={TaskFields.prices}
      itemMap={itemMap}
    />
  );
});

export const TaskView = observer(() => {
  const { taskStore, goalStore } = useStore();
  const { setVisible1, isVisible, setVisible } = useVisible();
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const [params, setParams] = useSearchParams();
  const objWithFields = new Task({}).$;
  const [shownFields, setShownFields] = useLocalStorageState(
    Object.keys(objWithFields) as (keyof TaskInterface)[],
    "shownFieldsTask"
  );
  const fetchFcn = async () => {
    const resp = await taskStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(
    () =>
      [
        {
          key: "goal",
          values: goalStore.items,
          label: "title",
        },
        {
          key: "repeat",
          values: FREQUENCY_CHOICES,
          label: "",
        },
      ] satisfies KV<any>[],
    [goalStore.items.length]
  );

  const actionModalDefs = [
    {
      icon: "NoteAdd",
      label: "NEW",
      name: "Add a Task",
      modal: <TaskForm fetchFcn={fetchFcn} setVisible={setVisible1} />,
    },
    {
      icon: "ViewList",
      label: "FIELDS",
      name: "Show Fields",
      modal: (
        <MyMultiDropdownSelector
          label="Fields"
          value={shownFields}
          onChangeValue={(t) => setShownFields(t as (keyof TaskInterface)[])}
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
      modal: <TaskFilter />,
    },
  ] satisfies ActionModalDef[];

  return (
    <MyGenericView<TaskInterface>
      fetchFcn={fetchFcn}
      actionModalDefs={actionModalDefs}
      isVisible={isVisible}
      setVisible={setVisible}
      Context={TaskViewContext}
      CollectionComponent={TaskCollection}
      TableComponent={TaskTable}
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
