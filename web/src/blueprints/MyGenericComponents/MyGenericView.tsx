import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { SetURLSearchParams, useSearchParams } from "react-router-dom";
import { toTitleCase } from "../../constants/helpers";
import {
  useKeyPress,
  useLocalStorageState,
  VisibleMap,
} from "../../constants/hooks";
import { PaginatedDetails, StateSetter } from "../../constants/interfaces";
import { KV } from "../ItemDetails";
import { IconName, MyIcon } from "../MyIcon";
import { MyModal } from "../MyModal";
import { MyMultiDropdownSelector } from "../MyMultiDropdownSelector";
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

export const useViewValues = <
  U extends Object & { id?: number | null },
  T extends { $view: Record<string, any> }
>(
  name: string,
  obj: T,
  graphs: GraphType[] = ["pie", "line"]
) => {
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const [params, setParams] = useSearchParams();
  const availableGraphs = graphs as GraphType[];
  const objWithFields = obj.$view;
  const [graph, setGraph] = useState<GraphType>("pie");
  const [shownFields, setShownFields] = useLocalStorageState(
    Object.keys(objWithFields) as (keyof U)[],
    `shownFields${name}`
  );
  const [sortFields, setSortFields] = useLocalStorageState(
    [] as string[],
    `sortFields${name}`
  );

  return {
    pageDetails,
    setPageDetails,
    params,
    setParams,
    availableGraphs,
    graph,
    setGraph,
    shownFields,
    setShownFields,
    sortFields,
    setSortFields,
    objWithFields,
  };
};

export const MyGenericView = observer(
  <T extends Record<string, any>>(props: {
    fetchFcn: () => void;
    Context: React.Context<GenericViewProps<T> | null>;
    CollectionComponent: React.FC;
    TableComponent: React.FC;
    FormComponent: React.ComponentType<{
      setVisible: (v: boolean) => void;
      fetchFcn: () => void;
    }>;
    FilterComponent: React.FC;
    shownFields: (keyof T)[];
    setShownFields: StateSetter<(keyof T)[]>;
    objWithFields: Record<string, any>;
    sortFields: string[];
    setSortFields: StateSetter<string[]>;
    graph: GraphType;
    setGraph: StateSetter<GraphType>;
    availableGraphs: GraphType[];
    actionModalDefs?: readonly ActionModalDef[];
    pageDetails: PaginatedDetails | undefined;
    setPageDetails: StateSetter<PaginatedDetails | undefined>;
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
      FormComponent,
      FilterComponent,
      objWithFields,
      actionModalDefs,
      isVisible,
      setVisible,
      shownFields,
      setShownFields,
      availableGraphs,
      pageDetails,
      setPageDetails,
      params,
      setParams,
      itemMap,
      sortFields,
      setSortFields,
      graph,
      setGraph,
      title,
    } = props;

    const setVisibleForIndex = (index: number) => {
      return (value: boolean) => {
        setVisible(index, value); // Use setVisible with the given index
      };
    };

    const defaultActionModalDefs = [
      {
        icon: "NoteAdd",
        label: "NEW",
        name: "Add a Account",
        modal: (
          <FormComponent
            fetchFcn={fetchFcn}
            setVisible={setVisibleForIndex(1)}
          />
        ),
      },
      {
        icon: "ViewList",
        label: "FIELDS",
        name: "Show Fields",
        modal: (
          <MyMultiDropdownSelector
            label="Fields"
            value={shownFields as string[]}
            onChangeValue={(t) => setShownFields(t as (keyof T)[])}
            options={Object.keys(objWithFields).map((s) => ({
              id: s,
              name: toTitleCase(s),
            }))}
            relative
            open
          />
        ),
      },
      {
        icon: "FilterListAlt",
        label: "FILTERS",
        name: "Filters",
        modal: <FilterComponent />,
      },
    ] satisfies ActionModalDef[];

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

    const Modals = [...defaultActionModalDefs, ...(actionModalDefs ?? [])]
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
        [...defaultActionModalDefs, ...(actionModalDefs ?? [])].map(
          (def, i) => ({
            icon: <MyIcon icon={def.icon} fontSize="large" label={def.label} />,
            name: def.name,
            onClick: () => setVisible(i + 1, true),
          })
        ),
      [setVisible, actionModalDefs, defaultActionModalDefs]
    );

    actions.forEach((s, ind) =>
      useKeyPress(["Alt", `Digit${ind + 1}`], s.onClick)
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
      setPageDetails,
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
