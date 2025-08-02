import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { useStore } from "../../api/Store";
import { Task, TaskInterface } from "../../api/TaskStore";
import { MyEisenhowerChart } from "../../blueprints/MyCharts/MyEisenhowerChart";
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
    [goalStore.items.length, scheduleStore.items.length]
  );

  return (
    <MyGenericForm<TaskInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="task"
      fields={fields}
      store={taskStore}
      datetimeFields={taskStore.datetimeFields}
      dateFields={taskStore.dateFields}
      timeFields={taskStore.timeFields}
    />
  );
};

export const TaskCard = observer((props: { item: Task }) => {
  const { item } = props;
  const { fetchFcn, shownFields, itemMap, related } = useTaskView();
  const { taskStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id"]}
      important={["title"]}
      prices={taskStore.priceFields}
      FormComponent={TaskForm}
      deleteItem={taskStore.deleteItem}
      fetchFcn={fetchFcn}
      itemMap={itemMap}
      related={related}
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
      <MyEisenhowerChart items={tasks} title="Tasks" />
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
  const { taskStore } = useStore();
  return (
    <MyGenericFilter
      view={new Task({}).$view}
      title="Task Filters"
      dateFields={[...taskStore.datetimeFields, ...taskStore.dateFields]}
      relatedFields={taskStore.relatedFields}
      optionFields={taskStore.optionFields}
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
      priceFields={taskStore.priceFields}
      {...values}
    />
  );
});

export const TaskView = observer(() => {
  const { taskStore, settingStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<TaskInterface, Task>(
    settingStore,
    "Task",
    new Task({})
  );
  const { params, setPageDetails } = values;
  const fetchFcn = async () => {
    const resp = await taskStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(() => [] satisfies KV<any>[], []);

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
      related={taskStore.related}
      fetchFcn={fetchFcn}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
