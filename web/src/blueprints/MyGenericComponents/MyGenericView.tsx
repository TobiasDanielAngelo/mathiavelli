import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { SetURLSearchParams } from "react-router-dom";
import { VisibleMap } from "../../constants/hooks";
import { PaginatedDetails, StateSetter } from "../../constants/interfaces";
import { KV } from "../ItemDetails";
import { IconName, MyIcon } from "../MyIcon";
import { MyModal } from "../MyModal";
import { MyPageBar } from "../MyPageBar";
import { MySpeedDial } from "../MySpeedDial";
import { GenericViewProps } from "./MyGenericProps";

export const graphTypes = ["pie", "line", "bar", "area"] as const;

export type GraphType = (typeof graphTypes)[number];

export type ActionModalDef = {
  icon: IconName;
  label: string;
  name: string;
  modal: React.ReactNode;
};

export const MyGenericView = observer(
  <T extends Record<string, any>>(props: {
    fetchFcn: () => void;
    Context: React.Context<GenericViewProps<T> | null>;
    CollectionComponent: React.FC;
    TableComponent: React.FC;
    shownFields: (keyof T)[];
    setShownFields: StateSetter<(keyof T)[]>;
    sortFields: string[];
    setSortFields: StateSetter<string[]>;
    availableGraphs: GraphType[];
    actionModalDefs: readonly ActionModalDef[];
    pageDetails: PaginatedDetails | undefined;
    isVisible: VisibleMap;
    setVisible: (index: number, visible: boolean) => void;
    params: URLSearchParams;
    setParams: SetURLSearchParams;
    itemMap: KV<any>[];
    title: string;
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
      availableGraphs,
      pageDetails,
      params,
      setParams,
      itemMap,
      sortFields,
      setSortFields,
      title,
    } = props;

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
        title={title}
      />
    );

    const Modals = actionModalDefs
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

    const actions = useMemo(
      () =>
        actionModalDefs.map((def, i) => ({
          icon: <MyIcon icon={def.icon} fontSize="large" label={def.label} />,
          name: def.name,
          onClick: () => setVisible(i + 1, true),
        })),
      [setVisible, actionModalDefs]
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
      fetchFcn,
      itemMap,
      graph,
      sortFields,
      setSortFields,
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
