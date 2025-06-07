import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { SetURLSearchParams } from "react-router-dom";
import { PayableInterface } from "../../api/PayableStore";
import { KV } from "../../blueprints/ItemDetails";
import { PaginatedDetails } from "../../constants/interfaces";

interface PayableViewProps {
  shownFields: (keyof PayableInterface)[];
  setShownFields: Dispatch<SetStateAction<(keyof PayableInterface)[]>>;
  params: URLSearchParams;
  setParams: SetURLSearchParams;
  pageDetails: PaginatedDetails | undefined;
  itemMap: KV<any>[];
  PageBar: React.FC;
  fetchFcn: () => void;
}

export const PayableViewContext = createContext<PayableViewProps | null>(null);

export const usePayableView = () => {
  const ctx = useContext(PayableViewContext);
  if (!ctx)
    throw new Error("usePayableView must be used within PayableViewContext");
  return ctx;
};
