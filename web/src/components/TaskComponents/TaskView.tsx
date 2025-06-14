import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useStore } from "../../api/Store";
import { FREQUENCY_CHOICES, Task, TaskInterface } from "../../api/TaskStore";
import { KV } from "../../blueprints/ItemDetails";
import { MyIcon } from "../../blueprints/MyIcon";
import { MyModal } from "../../blueprints/MyModal";
import { MyMultiDropdownSelector } from "../../blueprints/MyMultiDropdownSelector";
import { MyPageBar } from "../../blueprints/MyPageBar";
import { MySpeedDial } from "../../blueprints/MySpeedDial";
import { getUniqueIdsFromFK, toTitleCase } from "../../constants/helpers";
import { useLocalStorageState, useVisible } from "../../constants/hooks";
import { PaginatedDetails } from "../../constants/interfaces";
import {
  TaskCollection,
  TaskFilter,
  TaskForm,
  TaskTable,
  TaskViewContext,
} from "./TaskComponents";

export const TaskView = observer(() => {
  const { taskStore, goalStore } = useStore();
  const [view, setView] = useState<"card" | "table">("card");
  const {
    isVisible1,
    setVisible1,
    isVisible2,
    setVisible2,
    isVisible3,
    setVisible3,
  } = useVisible();
  const [shownFields, setShownFields] = useLocalStorageState(
    Object.keys(new Task({}).$view) as (keyof TaskInterface)[],
    "shownFieldsTask"
  );

  const [params, setParams] = useSearchParams();
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const queryString = new URLSearchParams(params).toString();

  const fetchTasks = async () => {
    const resp = await taskStore.fetchAll(queryString);
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
    const goals = getUniqueIdsFromFK(resp.data, "goal");
    if (goals.length) goalStore.fetchAll(`id__in=${goals.join(",")}`);
  };

  const toggleView = () => {
    setView((prev) => (prev === "card" ? "table" : "card"));
  };

  const onClickPrev = () => {
    setParams((t) => {
      const newParams = new URLSearchParams(t);
      const currentPage = Number(newParams.get("page")) || 1;
      newParams.set("page", String(Math.max(currentPage - 1, 1)));
      return newParams;
    });
  };

  const onClickNext = () => {
    setParams((t) => {
      const newParams = new URLSearchParams(t);
      const currentPage = Number(newParams.get("page")) || 1;
      newParams.set(
        "page",
        String(
          Math.min(currentPage + 1, pageDetails?.totalPages ?? currentPage)
        )
      );
      return newParams;
    });
  };

  const onClickPage = (s: number) => {
    setParams((t) => {
      const newParams = new URLSearchParams(t);
      newParams.set("page", String(s));
      return newParams;
    });
  };

  const PageBar = () => (
    <MyPageBar
      pageDetails={pageDetails}
      onClickNext={onClickNext}
      onClickPrev={onClickPrev}
      onClickPage={onClickPage}
    />
  );

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
      ] as KV<any>[],
    [goalStore.items.length]
  );

  const actions = useMemo(
    () => [
      {
        icon: (
          <div className="flex flex-col items-center">
            <MyIcon icon="AddCard" fontSize="large" />
            <div className="text-xs text-gray-500 font-bold">TASK</div>
          </div>
        ),
        name: "Add a Task",
        onClick: () => setVisible1(true),
      },
      {
        icon: (
          <div className="flex flex-col items-center">
            <MyIcon icon="AddCard" fontSize="large" />
            <div className="text-xs text-gray-500 font-bold">FIELDS</div>
          </div>
        ),
        name: "Show Fields",
        onClick: () => setVisible2(true),
      },
      {
        icon: (
          <div className="flex flex-col items-center">
            <MyIcon icon="AddCard" fontSize="large" />
            <div className="text-xs text-gray-500 font-bold">FILTERS</div>
          </div>
        ),
        name: "Filters",
        onClick: () => setVisible3(true),
      },
    ],
    []
  );

  useEffect(() => {
    fetchTasks();
  }, [params]);

  const value = {
    shownFields,
    setShownFields,
    params,
    setParams,
    pageDetails,
    itemMap,
    PageBar,
    fetchFcn: fetchTasks,
  };

  return (
    <TaskViewContext.Provider value={value}>
      <div className="relative">
        <MySpeedDial actions={actions} />
        <MyModal isVisible={isVisible1} setVisible={setVisible1} disableClose>
          <TaskForm setVisible={setVisible1} fetchFcn={fetchTasks} />
        </MyModal>
        <MyModal isVisible={isVisible2} setVisible={setVisible2} disableClose>
          <MyMultiDropdownSelector
            label="Fields"
            value={shownFields}
            onChangeValue={(t) => setShownFields(t as (keyof TaskInterface)[])}
            options={Object.keys(new Task({}).$view).map((s) => ({
              id: s,
              name: toTitleCase(s),
            }))}
            relative
            open
          />
        </MyModal>
        <MyModal isVisible={isVisible3} setVisible={setVisible3} disableClose>
          <TaskFilter />
        </MyModal>
        {view === "card" ? <TaskCollection /> : <TaskTable />}
        <div
          className="fixed bottom-6 left-6 bg-blue-500 text-white rounded-full w-14 h-14 flex items-center justify-center cursor-pointer shadow-lg hover:bg-blue-600 transition-colors"
          onClick={toggleView}
          title="Toggle View"
        >
          {view === "card" ? "📊" : "🗂️"}
        </div>
      </div>
    </TaskViewContext.Provider>
  );
});
