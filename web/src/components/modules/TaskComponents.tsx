import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { useStore } from "../../api/Store";
import { Task, TaskFields, TaskInterface } from "../../api/TaskStore";
import { KV } from "../../blueprints/ItemDetails";
import { MyEisenhowerChart } from "../../blueprints/MyCharts/MyEisenhowerChart";
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

export const { Context: TaskViewContext, useGenericView: useTaskView } =
  createGenericViewContext<TaskInterface>();

const title = "Tasks";

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
  const { taskStore, goalStore, scheduleStore } = useStore();

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
            name: "importance",
            label: "Importance (0-10)",
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
            name: "isArchived",
            label: "Archived?",
            type: "check",
          },
          {
            name: "schedule",
            label: "Schedule",
            type: "select",
            options: toOptions(scheduleStore.items, "name"),
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
            name: "dueDate",
            label: "Due Date",
            type: "date",
          },
        ],
      ] satisfies Field[][],
    [goalStore.items.length, scheduleStore.items.length, item?.id]
  );

  return (
    <MyGenericForm<TaskInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="task"
      fields={fields}
      store={taskStore}
      datetimeFields={TaskFields.datetimeFields}
      dateFields={TaskFields.dateFields}
      timeFields={TaskFields.timeFields}
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
      header={["id", "dueDate"]}
      important={["title"]}
      prices={TaskFields.pricesFields}
      FormComponent={TaskForm}
      deleteItem={taskStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const TaskDashboard = observer(() => {
  const { taskStore } = useStore();
  const tasks = taskStore.items
    .filter((s) => !s.dateCompleted && !s.isArchived && s.dueDate)
    .map((s) => ({
      id: s.id,
      name: s.title,
      importance: 10 * s.importance,
      dueDate: new Date(s.dueDate),
    }));

  return (
    <>
      <MyEisenhowerChart items={tasks} />
    </>
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
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={taskStore.items}
        />
      }
      SideB={<TaskDashboard />}
      ratio={0.7}
    />
  );
});

export const TaskFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new Task({}).$view}
      title="Task Filters"
      dateFields={[...TaskFields.datetimeFields, ...TaskFields.dateFields]}
      excludeFields={["id"]}
      relatedFields={[]}
      optionFields={[]}
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
  const values = useTaskView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={taskStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <TaskRow item={item} />}
      priceFields={TaskFields.pricesFields}
      {...values}
    />
  );
});

export const TaskView = observer(() => {
  const { taskStore, goalStore, scheduleStore, habitStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<TaskInterface, Task>("Task", new Task({}));
  const { params, setPageDetails } = values;
  const fetchFcn = async () => {
    const resp = await taskStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
    const habits = resp.data.map((s) => s.habit).filter(Boolean);
    habitStore.fetchAll(`id__in=${habits.join(",")}`);
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
          key: "schedule",
          values: scheduleStore.items,
          label: "name",
        },
        {
          key: "habit",
          values: habitStore.items,
          label: "title",
        },
      ] satisfies KV<any>[],
    [
      goalStore.items.length,
      scheduleStore.items.length,
      habitStore.items.length,
    ]
  );

  const actionModalDefs = [] satisfies ActionModalDef[];

  return (
    <MyGenericView<TaskInterface>
      title={title}
      Context={TaskViewContext}
      CollectionComponent={TaskCollection}
      FormComponent={TaskForm}
      FilterComponent={TaskFilter}
      actionModalDefs={actionModalDefs}
      TableComponent={TaskTable}
      fetchFcn={fetchFcn}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
