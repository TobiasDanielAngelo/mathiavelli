import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Platform, PlatformInterface } from "../../api/PlatformStore";
import { useStore } from "../../api/Store";
import { MyIcon } from "../../blueprints/MyIcon";
import { MyModal } from "../../blueprints/MyModal";
import { MyMultiDropdownSelector } from "../../blueprints/MyMultiDropdownSelector";
import { MyPageBar } from "../../blueprints/MyPageBar";
import { MySpeedDial } from "../../blueprints/MySpeedDial";
import { toTitleCase } from "../../constants/helpers";
import { useLocalStorageState, useVisible } from "../../constants/hooks";
import { PaginatedDetails } from "../../constants/interfaces";
import {
  PlatformCollection,
  PlatformFilter,
  PlatformForm,
  PlatformTable,
  PlatformViewContext,
} from "./PlatformComponents";

export const PlatformView = observer(() => {
  const { platformStore } = useStore();
  const [view, setView] = useState<"card" | "table">("card");
  const {
    isVisible1,
    setVisible1,
    isVisible2,
    setVisible2,
    isVisible3,
    setVisible3,
  } = useVisible();
  const [shownFields, setShownFields] = useLocalStorageState<
    (keyof PlatformInterface)[]
  >(
    Object.keys(new Platform({}).$) as (keyof PlatformInterface)[],
    "shownFieldsPlatform"
  );
  const [params, setParams] = useSearchParams();
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const queryString = new URLSearchParams(params).toString();

  const fetchPlatforms = async () => {
    const resp = await platformStore.fetchAll(queryString);
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

  const actions = useMemo(
    () => [
      {
        icon: (
          <div className="flex flex-col items-center">
            <MyIcon icon="AddCard" fontSize="large" />
            <div className="text-xs text-gray-500 font-bold">PLATF</div>
          </div>
        ),
        name: "Add a Platform",
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
    fetchPlatforms();
  }, [params]);

  const value = {
    shownFields,
    setShownFields,
    params,
    setParams,
    pageDetails,
    PageBar,
    fetchFcn: fetchPlatforms,
  };

  return (
    <PlatformViewContext.Provider value={value}>
      <div className="relative">
        <MySpeedDial actions={actions} />
        <MyModal isVisible={isVisible1} setVisible={setVisible1} disableClose>
          <PlatformForm setVisible={setVisible1} fetchFcn={fetchPlatforms} />
        </MyModal>
        <MyModal isVisible={isVisible2} setVisible={setVisible2} disableClose>
          <MyMultiDropdownSelector
            label="Fields"
            value={shownFields}
            onChangeValue={(t) =>
              setShownFields(t as (keyof PlatformInterface)[])
            }
            options={Object.keys(new Platform({}).$).map((s) => ({
              id: s,
              name: toTitleCase(s),
            }))}
            relative
            open
          />
        </MyModal>
        <MyModal isVisible={isVisible3} setVisible={setVisible3} disableClose>
          <PlatformFilter />
        </MyModal>
        {view === "card" ? <PlatformCollection /> : <PlatformTable />}
        <div
          className="fixed bottom-6 left-6 bg-blue-500 text-white rounded-full w-14 h-14 flex items-center justify-center cursor-pointer shadow-lg hover:bg-blue-600 transition-colors"
          onClick={toggleView}
          title="Toggle View"
        >
          {view === "card" ? "📊" : "🗂️"}
        </div>
      </div>
    </PlatformViewContext.Provider>
  );
});
