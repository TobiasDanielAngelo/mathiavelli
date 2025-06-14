import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { MyIcon } from "../../blueprints/MyIcon";
import { useSearchParams } from "react-router-dom";
import { Category, CategoryInterface } from "../../api/CategoryStore";
import { useStore } from "../../api/Store";
import { MyModal } from "../../blueprints/MyModal";
import { MyMultiDropdownSelector } from "../../blueprints/MyMultiDropdownSelector";
import { MyPageBar } from "../../blueprints/MyPageBar";
import { MySpeedDial } from "../../blueprints/MySpeedDial";
import { toTitleCase } from "../../constants/helpers";
import { useLocalStorageState, useVisible } from "../../constants/hooks";
import { PaginatedDetails } from "../../constants/interfaces";
import {
  CategoryCollection,
  CategoryFilter,
  CategoryForm,
  CategoryTable,
  CategoryViewContext,
} from "./CategoryComponents";

export const CategoryView = observer(() => {
  const { categoryStore } = useStore();
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
    (keyof CategoryInterface)[]
  >(
    Object.keys(new Category({}).$) as (keyof CategoryInterface)[],
    "shownFieldsCategory"
  );
  const [params, setParams] = useSearchParams();
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const queryString = new URLSearchParams(params).toString();

  const fetchFcn = async () => {
    const resp = await categoryStore.fetchAll(queryString);
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
        icon: <MyIcon icon="NoteAdd" fontSize="large" label="CATEG." />,
        name: "Add a Category",
        onClick: () => setVisible1(true),
      },
      {
        icon: <MyIcon icon="ViewList" fontSize="large" label="FIELDS" />,
        name: "Show Fields",
        onClick: () => setVisible2(true),
      },
      {
        icon: <MyIcon icon="FilterListAlt" fontSize="large" label="FILTERS" />,
        name: "Filters",
        onClick: () => setVisible3(true),
      },
    ],
    []
  );

  useEffect(() => {
    fetchFcn();
  }, [params]);

  const value = {
    shownFields,
    setShownFields,
    params,
    setParams,
    pageDetails,
    PageBar,
    fetchFcn: fetchFcn,
  };

  return (
    <CategoryViewContext.Provider value={value}>
      <div className="relative">
        <MySpeedDial actions={actions} />
        <MyModal isVisible={isVisible1} setVisible={setVisible1} disableClose>
          <CategoryForm setVisible={setVisible1} fetchFcn={fetchFcn} />
        </MyModal>
        <MyModal isVisible={isVisible2} setVisible={setVisible2} disableClose>
          <MyMultiDropdownSelector
            label="Fields"
            value={shownFields}
            onChangeValue={(t) =>
              setShownFields(t as (keyof CategoryInterface)[])
            }
            options={Object.keys(new Category({}).$).map((s) => ({
              id: s,
              name: toTitleCase(s),
            }))}
            relative
            open
          />
        </MyModal>
        <MyModal isVisible={isVisible3} setVisible={setVisible3} disableClose>
          <CategoryFilter />
        </MyModal>
        {view === "card" ? <CategoryCollection /> : <CategoryTable />}
        <div
          className="fixed bottom-6 left-6 bg-blue-500 text-white rounded-full w-14 h-14 flex items-center justify-center cursor-pointer shadow-lg hover:bg-blue-600 transition-colors"
          onClick={toggleView}
          title="Toggle View"
        >
          {view === "card" ? "📊" : "🗂️"}
        </div>
      </div>
    </CategoryViewContext.Provider>
  );
});
