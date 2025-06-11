import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { SetURLSearchParams } from "react-router-dom";
import { JobInterface } from "../../api/JobStore";
import { KV } from "../../blueprints/ItemDetails";
import { PaginatedDetails } from "../../constants/interfaces";

interface JobViewProps {
  shownFields: (keyof JobInterface)[];
  setShownFields: Dispatch<SetStateAction<(keyof JobInterface)[]>>;
  params: URLSearchParams;
  setParams: SetURLSearchParams;
  pageDetails: PaginatedDetails | undefined;
  itemMap: KV<any>[];
  PageBar: React.FC;
  fetchFcn: () => void;
}

export const JobViewContext = createContext<JobViewProps | null>(null);

export const useJobView = () => {
  const ctx = useContext(JobViewContext);
  if (!ctx) throw new Error("useJobView must be used within JobViewContext");
  return ctx;
};
