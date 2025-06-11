import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { SetURLSearchParams } from "react-router-dom";
import { FollowUpInterface } from "../../api/FollowUpStore";
import { KV } from "../../blueprints/ItemDetails";
import { PaginatedDetails } from "../../constants/interfaces";

interface FollowUpViewProps {
  shownFields: (keyof FollowUpInterface)[];
  setShownFields: Dispatch<SetStateAction<(keyof FollowUpInterface)[]>>;
  params: URLSearchParams;
  setParams: SetURLSearchParams;
  pageDetails: PaginatedDetails | undefined;
  itemMap: KV<any>[];
  PageBar: React.FC;
  fetchFcn: () => void;
}

export const FollowUpViewContext = createContext<FollowUpViewProps | null>(
  null
);

export const useFollowUpView = () => {
  const ctx = useContext(FollowUpViewContext);
  if (!ctx)
    throw new Error("useFollowUpView must be used within FollowUpViewContext");
  return ctx;
};
