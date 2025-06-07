import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { SetURLSearchParams } from "react-router-dom";
import { BuyListItemInterface } from "../../api/BuyListItemStore";
import { KV } from "../../blueprints/ItemDetails";
import { PaginatedDetails } from "../../constants/interfaces";

interface BuyListItemViewProps {
  shownFields: (keyof BuyListItemInterface)[];
  setShownFields: Dispatch<SetStateAction<(keyof BuyListItemInterface)[]>>;
  params: URLSearchParams;
  setParams: SetURLSearchParams;
  pageDetails: PaginatedDetails | undefined;
  itemMap: KV<any>[];
  PageBar: React.FC;
  fetchFcn: () => void;
}

export const BuyListItemViewContext =
  createContext<BuyListItemViewProps | null>(null);

export const useBuyListItemView = () => {
  const ctx = useContext(BuyListItemViewContext);
  if (!ctx)
    throw new Error(
      "useBuyListItemView must be used within BuyListItemViewContext"
    );
  return ctx;
};
