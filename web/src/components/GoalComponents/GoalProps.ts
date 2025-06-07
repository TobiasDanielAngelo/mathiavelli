import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { SetURLSearchParams } from "react-router-dom";
import { GoalInterface } from "../../api/GoalStore";
import { KV } from "../../blueprints/ItemDetails";
import { PaginatedDetails } from "../../constants/interfaces";

interface GoalViewProps {
  shownFields: (keyof GoalInterface)[];
  setShownFields: Dispatch<SetStateAction<(keyof GoalInterface)[]>>;
  params: URLSearchParams;
  setParams: SetURLSearchParams;
  pageDetails: PaginatedDetails | undefined;
  itemMap: KV<any>[];
  PageBar: React.FC;
  fetchFcn: () => void;
}

export const GoalViewContext = createContext<GoalViewProps | null>(null);

export const useGoalView = () => {
  const ctx = useContext(GoalViewContext);
  if (!ctx) throw new Error("useGoalView must be used within GoalViewContext");
  return ctx;
};
