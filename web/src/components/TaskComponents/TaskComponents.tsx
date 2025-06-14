import { observer } from "mobx-react-lite";
import { FREQUENCY_CHOICES, Task, TaskFields } from "../../api/TaskStore";
import { useStore } from "../../api/Store";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { sortAndFilterByIds, toOptions } from "../../constants/helpers";
import { Field } from "../../constants/interfaces";
import { MyGenericCard } from "../../blueprints/MyGenericComponents/MyGenericCard";
import { MyGenericFilter } from "../../blueprints/MyGenericComponents/MyGenericFilter";
import { MyGenericForm } from "../../blueprints/MyGenericComponents/MyGenericForm";
import { MyGenericRow } from "../../blueprints/MyGenericComponents/MyGenericRow";
import { MyGenericTable } from "../../blueprints/MyGenericComponents/MyGenericTable";
import { TaskInterface } from "../../api/TaskStore";
import { createGenericViewContext } from "../../blueprints/MyGenericComponents/MyGenericProps";
import { useMemo } from "react";

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
        <div className="flex flex-col min-h-[85vh]">
          <PageBar />
          <div className="flex-1">
            {sortAndFilterByIds(
              taskStore.items,
              pageDetails?.ids ?? [],
              (s) => s.id
            ).map((s) => (
              <TaskCard item={s} key={s.id} />
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

export const TaskFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new Task({}).$}
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
  const { shownFields, params, setParams, pageDetails, PageBar } =
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
    />
  );
});
