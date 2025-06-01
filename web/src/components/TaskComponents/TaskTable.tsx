import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { useStore } from "../../api/Store";
import { Task, TaskInterface } from "../../api/TaskStore";
import {
  camelToSnakeCase,
  formatValue,
  toTitleCase,
} from "../../constants/helpers";
import { TaskRow } from "./TaskRow";
import { MyTable } from "../../blueprints/MyTable";
import { useTaskView } from "./TaskProps";

export const TaskTable = observer(() => {
  const { taskStore, goalStore } = useStore();
  const { shownFields, params, setParams, pageDetails, itemMap, PageBar } =
    useTaskView();

  const HeaderWithSort = ({ k }: { k: string }) => {
    const orderByParams = params.getAll("order_by");
    const snakeK = camelToSnakeCase(k);
    const isActive = orderByParams.some((s) => s.replace("-", "") === snakeK);
    const isDescending = orderByParams.includes(`-${snakeK}`);

    const handleSortClick = () => {
      setParams((t) => {
        const newParams = new URLSearchParams(t);
        const existingOrderBy = newParams.getAll("order_by");
        let newOrderBy: string[] = [];

        let currentState: "none" | "asc" | "desc" = "none";
        existingOrderBy.forEach((field) => {
          if (field === snakeK) currentState = "asc";
          if (field === `-${snakeK}`) currentState = "desc";
        });

        if (currentState === "none") {
          newOrderBy = [snakeK, ...existingOrderBy.slice(0, 1)];
        } else if (currentState === "asc") {
          newOrderBy = [
            `-${snakeK}`,
            ...existingOrderBy.filter((f) => f.replace("-", "") !== snakeK),
          ];
        } else {
          newOrderBy = existingOrderBy.filter(
            (f) => f.replace("-", "") !== snakeK
          );
        }

        newParams.delete("order_by");
        newOrderBy.forEach((field) => newParams.append("order_by", field));

        newParams.set("page", "1");
        return newParams;
      });
    };

    return (
      <div
        className="items-center justify-center flex flex-row gap-2 cursor-pointer"
        onClick={handleSortClick}
      >
        {toTitleCase(k)}
        {isActive && <div>{isDescending ? "▾" : "▴"}</div>}
      </div>
    );
  };

  const matrix = useMemo(() => {
    const keys = Object.keys(new Task({}).$).filter((s) =>
      shownFields.includes(s as keyof TaskInterface)
    );
    const header = [
      ...keys.map((k) => <HeaderWithSort k={k} key={k} />),
      "Actions",
    ];
    const rows = taskStore.items
      .filter((s) => pageDetails?.ids?.includes(s.id))
      .sort((a, b) => {
        return (
          (pageDetails?.ids?.indexOf(a.id) ?? 0) -
          (pageDetails?.ids?.indexOf(b.id) ?? 0)
        );
      })
      .map((item) => [
        ...keys.map((key) => {
          const kv = itemMap.find((s) => s.key === key);
          return formatValue(item[key as keyof TaskInterface], key, [], kv);
        }),
        <TaskRow item={item} />,
      ]);

    return [header, ...rows];
  }, [
    taskStore.itemsSignature,
    shownFields.length,
    pageDetails?.ids,
    goalStore.items.length,
  ]);

  return (
    <>
      <div className="flex flex-1 flex-col min-h-[85vh] max-h-[85vh] w-5/6 justify-center m-auto">
        <div className="sticky top-0">
          <PageBar />
        </div>
        <div className="flex-1 overflow-scroll">
          <MyTable matrix={matrix} />
        </div>
      </div>
    </>
  );
});
