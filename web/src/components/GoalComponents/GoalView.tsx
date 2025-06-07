import AddCardIcon from "@mui/icons-material/AddCard";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Goal, GoalInterface } from "../../api/GoalStore";
import { useStore } from "../../api/Store";
import { KV } from "../../blueprints/ItemDetails";
import { MyModal } from "../../blueprints/MyModal";
import { MyMultiDropdownSelector } from "../../blueprints/MyMultiDropdownSelector";
import { MyPageBar } from "../../blueprints/MyPageBar";
import { MySpeedDial } from "../../blueprints/MySpeedDial";
import { frequency } from "../../constants/constants";
import { getUniqueIdsFromFK, toTitleCase } from "../../constants/helpers";
import { PaginatedDetails } from "../../constants/interfaces";
import { GoalCollection } from "./GoalCollection";
import { GoalFilter } from "./GoalFilter";
import { GoalForm } from "./GoalForm";
import { GoalViewContext } from "./GoalProps";
import { GoalTable } from "./GoalTable";
import { useLocalStorageState, useVisible } from "../../constants/hooks";

export const GoalView = observer(() => {
  const { goalStore, taskStore } = useStore();
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
    Object.keys(new Goal({}).$view) as (keyof GoalInterface)[],
    "shownFieldsGoal"
  );
  const [params, setParams] = useSearchParams();
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const queryString = new URLSearchParams(params).toString();

  const fetchGoals = async () => {
    const resp = await goalStore.fetchAll(queryString);
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
    const parentGoals = getUniqueIdsFromFK(resp.data, "parentGoal");
    if (parentGoals.length)
      goalStore.fetchAll(`id__in=${parentGoals.join(",")}`);
    taskStore.fetchAll(`goal__in=${resp.data.map((s) => s.id)}`);
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
          key: "parentGoal",
          values: goalStore.items,
          label: "title",
        },
      ] as KV<any>[],
    [goalStore.items.length, frequency]
  );

  const actions = useMemo(
    () => [
      {
        icon: (
          <div className="flex flex-col items-center">
            <AddCardIcon fontSize="large" />
            <div className="text-xs text-gray-500 font-bold">GOAL</div>
          </div>
        ),
        name: "Add a Goal",
        onClick: () => setVisible1(true),
      },
      {
        icon: (
          <div className="flex flex-col items-center">
            <AddCardIcon fontSize="large" />
            <div className="text-xs text-gray-500 font-bold">FIELDS</div>
          </div>
        ),
        name: "Show Fields",
        onClick: () => setVisible2(true),
      },
      {
        icon: (
          <div className="flex flex-col items-center">
            <AddCardIcon fontSize="large" />
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
    fetchGoals();
  }, [params]);

  const value = {
    shownFields,
    setShownFields,
    params,
    setParams,
    pageDetails,
    itemMap,
    PageBar,
    fetchFcn: fetchGoals,
  };

  return (
    <GoalViewContext.Provider value={value}>
      <div className="relative">
        <MySpeedDial actions={actions} />
        <MyModal isVisible={isVisible1} setVisible={setVisible1} disableClose>
          <GoalForm setVisible={setVisible1} fetchFcn={fetchGoals} />
        </MyModal>
        <MyModal isVisible={isVisible2} setVisible={setVisible2} disableClose>
          <MyMultiDropdownSelector
            label="Fields"
            value={shownFields}
            onChangeValue={(t) => setShownFields(t as (keyof GoalInterface)[])}
            options={Object.keys(new Goal({}).$view).map((s) => ({
              id: s,
              name: toTitleCase(s),
            }))}
            relative
            open
          />
        </MyModal>
        <MyModal isVisible={isVisible3} setVisible={setVisible3} disableClose>
          <GoalFilter />
        </MyModal>
        {view === "card" ? <GoalCollection /> : <GoalTable />}
        <div
          className="fixed bottom-6 left-6 bg-blue-500 text-white rounded-full w-14 h-14 flex items-center justify-center cursor-pointer shadow-lg hover:bg-blue-600 transition-colors"
          onClick={toggleView}
          title="Toggle View"
        >
          {view === "card" ? "📊" : "🗂️"}
        </div>
      </div>
    </GoalViewContext.Provider>
  );
});
