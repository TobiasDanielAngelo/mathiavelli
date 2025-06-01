import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { SetURLSearchParams } from "react-router-dom";
import { TaskInterface } from "../../api/TaskStore";
import { KV } from "../../blueprints/ItemDetails";
import { PaginatedDetails } from "../../constants/interfaces";

interface TaskViewProps {
  shownFields: (keyof TaskInterface)[];
  setShownFields: Dispatch<SetStateAction<(keyof TaskInterface)[]>>;
  params: URLSearchParams;
  setParams: SetURLSearchParams;
  pageDetails: PaginatedDetails | undefined;
  itemMap: KV<any>[];
  PageBar: React.FC;
}

export const TaskViewContext = createContext<TaskViewProps | null>(null);

export const useTaskView = () => {
  const ctx = useContext(TaskViewContext);
  if (!ctx) throw new Error("useTaskView must be used within TaskViewContext");
  return ctx;
};
