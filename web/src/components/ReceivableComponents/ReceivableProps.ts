import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { SetURLSearchParams } from "react-router-dom";
import { ReceivableInterface } from "../../api/ReceivableStore";
import { KV } from "../../blueprints/ItemDetails";
import { PaginatedDetails } from "../../constants/interfaces";

interface ReceivableViewProps {
  shownFields: (keyof ReceivableInterface)[];
  setShownFields: Dispatch<SetStateAction<(keyof ReceivableInterface)[]>>;
  params: URLSearchParams;
  setParams: SetURLSearchParams;
  pageDetails: PaginatedDetails | undefined;
  itemMap: KV<any>[];
  PageBar: React.FC;
  fetchFcn: () => void;
}

export const ReceivableViewContext = createContext<ReceivableViewProps | null>(
  null
);

export const useReceivableView = () => {
  const ctx = useContext(ReceivableViewContext);
  if (!ctx)
    throw new Error(
      "useReceivableView must be used within ReceivableViewContext"
    );
  return ctx;
};
