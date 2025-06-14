import { useEffect, useMemo, useState } from "react";
import { SetURLSearchParams, useSearchParams } from "react-router-dom";
import { useLocalStorageState, VisibleMap } from "../../constants/hooks";
import { PaginatedDetails } from "../../constants/interfaces";
import { IconName, MyIcon } from "../MyIcon";
import { MyModal } from "../MyModal";
import { MyPageBar } from "../MyPageBar";
import { observer } from "mobx-react-lite";
import { GenericViewProps } from "./MyGenericProps";
import { MySpeedDial } from "../MySpeedDial";

const graphTypes = ["pie", "line", "bar", "area"] as const;

type GraphType = (typeof graphTypes)[number];

export const usePageBarWithState = <T extends object>(
  shownFieldsName: string,
  objWithFields: Record<string, any>,
  fetchFcn: () => void,
  availableGraphs: GraphType[] = ["pie", "line"]
) => {
  const [shownFields, setShownFields] = useLocalStorageState<(keyof T)[]>(
    Object.keys(objWithFields) as (keyof T)[],
    shownFieldsName
  );

  const graphIconMap: Record<GraphType, { icon: IconName; label: string }> =
    availableGraphs.reduce((acc, type) => {
      const iconMap: Record<GraphType, { icon: IconName; label: string }> = {
        pie: { icon: "PieChart", label: "PIE" },
        line: { icon: "Timeline", label: "LINE" },
        bar: { icon: "BarChart", label: "BAR" },
        area: { icon: "InsertChart", label: "AREA" },
      };
      acc[type] = iconMap[type];
      return acc;
    }, {} as Record<GraphType, { icon: IconName; label: string }>);

  const [graph, setGraph] = useState<GraphType>("pie");

  const [view, setView] = useState<"card" | "table">("card");
  const [params, setParams] = useSearchParams();
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();

  const toggleView = () => {
    setView((prev) => (prev === "card" ? "table" : "card"));
  };

  const toggleGraph = () => {
    setGraph((prev) => {
      const currentIndex = availableGraphs.indexOf(prev);
      const nextIndex = (currentIndex + 1) % availableGraphs.length;
      return availableGraphs[nextIndex];
    });
  };

  const queryString = new URLSearchParams(params).toString();

  useEffect(() => {
    fetchFcn();
  }, [params]);

  const updatePage = (updateFn: (curr: number) => number) => {
    setParams((t) => {
      const p = new URLSearchParams(t);
      const curr = Number(p.get("page")) || 1;
      p.set("page", String(updateFn(curr)));
      return p;
    });
  };

  const PageBar = () => (
    <MyPageBar
      pageDetails={pageDetails}
      onClickPrev={() => updatePage((curr) => Math.max(curr - 1, 1))}
      onClickNext={() =>
        updatePage((curr) =>
          Math.min(curr + 1, pageDetails?.totalPages ?? curr)
        )
      }
      onClickPage={(n: number) => updatePage(() => n)}
    />
  );

  const views = useMemo(
    () => [
      {
        icon:
          view === "card" ? (
            <MyIcon icon="Padding" label="CARD" />
          ) : (
            <MyIcon icon="TableChart" label="TABLE" />
          ),
        name: "Toggle View",
        onClick: toggleView,
      },
      {
        icon: (
          <MyIcon
            {...(graphIconMap[graph] ?? { icon: "Help", label: "UNKNOWN" })}
          />
        ),
        name: "Toggle Graphs",
        onClick: toggleGraph,
      },
    ],
    [view, graph]
  );

  return {
    PageBar,
    queryString,
    shownFields,
    setShownFields,
    pageDetails,
    setPageDetails,
    params,
    setParams,
    view,
    setView,
    toggleView,
    graph,
    setGraph,
    toggleGraph,
    views,
  };
};

type ActionModalDef = {
  icon: IconName;
  label: string;
  name: string;
  modal: React.ReactNode;
};

export const useActionModals = (
  isVisible: VisibleMap,
  setVisible: (index: number, visible: boolean) => void,
  actionModalDefs: readonly ActionModalDef[]
) => {
  const AllModals = actionModalDefs
    .map((s) => s.modal)
    .map((child, i) => (
      <MyModal
        key={i}
        isVisible={isVisible[i + 1]}
        setVisible={(v) =>
          setVisible(
            i + 1,
            typeof v === "function" ? (v as any)(isVisible[i + 1]) : v
          )
        }
        disableClose
      >
        {child}
      </MyModal>
    ));

  return {
    actions: useMemo(
      () =>
        actionModalDefs.map((def, i) => ({
          icon: <MyIcon icon={def.icon} fontSize="large" label={def.label} />,
          name: def.name,
          onClick: () => setVisible(i + 1, true),
        })),
      [setVisible, actionModalDefs]
    ),
    Modals: AllModals,
  };
};

export const MyGenericView = observer(
  <T extends Record<string, any>>(props: {
    fetchFcn: () => Promise<void>;
    actionModalDefs: readonly ActionModalDef[];
    shownFields: (keyof T)[];
    setShownFields: React.Dispatch<React.SetStateAction<(keyof T)[]>>;
    params: URLSearchParams;
    setParams: SetURLSearchParams;
    pageDetails: PaginatedDetails | undefined;
    PageBar: React.FC;
    isVisible: VisibleMap;
    setVisible: (index: number, visible: boolean) => void;
    Context: React.Context<GenericViewProps<T> | null>;
    CollectionComponent: React.FC;
    TableComponent: React.FC;
    view: "table" | "card";
    views: {
      icon: React.ReactNode;
      name: string;
      onClick: () => void;
    }[];
  }) => {
    const {
      fetchFcn,
      Context,
      CollectionComponent,
      TableComponent,
      actionModalDefs,
      isVisible,
      setVisible,
      shownFields,
      setShownFields,
      params,
      setParams,
      pageDetails,
      PageBar,
      view,
      views,
    } = props;

    const { actions, Modals } = useActionModals(
      isVisible,
      setVisible,
      actionModalDefs
    );

    const value = {
      shownFields,
      setShownFields,
      params,
      setParams,
      pageDetails,
      PageBar,
      fetchFcn,
    };

    return (
      <Context.Provider value={value}>
        {view === "card" ? <CollectionComponent /> : <TableComponent />}
        {Modals}
        <MySpeedDial actions={actions} />
        <MySpeedDial actions={views} leftSide />
      </Context.Provider>
    );
  }
);
