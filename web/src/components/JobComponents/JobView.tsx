import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Job,
  JOB_TYPE_CHOICES,
  JobInterface,
  SOURCE_CHOICES,
  STATUS_CHOICES,
  WORK_SETUP_CHOICES,
} from "../../api/JobStore";
import { useStore } from "../../api/Store";
import { KV } from "../../blueprints/ItemDetails";
import { MyIcon } from "../../blueprints/MyIcon";
import { MyModal } from "../../blueprints/MyModal";
import { MyMultiDropdownSelector } from "../../blueprints/MyMultiDropdownSelector";
import { MyPageBar } from "../../blueprints/MyPageBar";
import { MySpeedDial } from "../../blueprints/MySpeedDial";
import { toTitleCase } from "../../constants/helpers";
import { useLocalStorageState, useVisible } from "../../constants/hooks";
import { PaginatedDetails } from "../../constants/interfaces";
import {
  JobCollection,
  JobFilter,
  JobForm,
  JobTable,
  JobViewContext,
} from "./JobComponents";

export const JobView = observer(() => {
  const { jobStore } = useStore();
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
    Object.keys(new Job({}).$view) as (keyof JobInterface)[],
    "shownFieldsJob"
  );

  const [params, setParams] = useSearchParams();
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const queryString = new URLSearchParams(params).toString();

  const fetchJobs = async () => {
    const resp = await jobStore.fetchAll(queryString);
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
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
          key: "status",
          values: STATUS_CHOICES,
          label: "",
        },
        {
          key: "source",
          values: SOURCE_CHOICES,
          label: "",
        },
        {
          key: "workSetup",
          values: WORK_SETUP_CHOICES,
          label: "",
        },
        {
          key: "jobType",
          values: JOB_TYPE_CHOICES,
          label: "",
        },
      ] as KV<any>[],
    []
  );

  const actions = useMemo(
    () => [
      {
        icon: (
          <div className="flex flex-col items-center">
            <MyIcon icon="AddCard" fontSize="large" />
            <div className="text-xs text-gray-500 font-bold">APPLY</div>
          </div>
        ),
        name: "Add a Job",
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
    fetchJobs();
  }, [params]);

  const value = {
    shownFields,
    setShownFields,
    params,
    setParams,
    pageDetails,
    itemMap,
    PageBar,
    fetchFcn: fetchJobs,
  };

  return (
    <JobViewContext.Provider value={value}>
      <div className="relative">
        <MySpeedDial actions={actions} />
        <MyModal isVisible={isVisible1} setVisible={setVisible1} disableClose>
          <JobForm setVisible={setVisible1} fetchFcn={fetchJobs} />
        </MyModal>
        <MyModal isVisible={isVisible2} setVisible={setVisible2} disableClose>
          <MyMultiDropdownSelector
            label="Fields"
            value={shownFields}
            onChangeValue={(t) => setShownFields(t as (keyof JobInterface)[])}
            options={Object.keys(new Job({}).$view).map((s) => ({
              id: s,
              name: toTitleCase(s),
            }))}
            relative
            open
          />
        </MyModal>
        <MyModal isVisible={isVisible3} setVisible={setVisible3} disableClose>
          <JobFilter />
        </MyModal>
        {view === "card" ? <JobCollection /> : <JobTable />}
        <div
          className="fixed bottom-6 left-6 bg-blue-500 text-white rounded-full w-14 h-14 flex items-center justify-center cursor-pointer shadow-lg hover:bg-blue-600 transition-colors"
          onClick={toggleView}
          title="Toggle View"
        >
          {view === "card" ? "📊" : "🗂️"}
        </div>
      </div>
    </JobViewContext.Provider>
  );
});
