import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { SetURLSearchParams } from "react-router-dom";
import { TransactionInterface } from "../../api/TransactionStore";
import { KV } from "../../blueprints/ItemDetails";
import { Graph, PaginatedDetails } from "../../constants/interfaces";

interface TransactionViewProps {
  shownFields: (keyof TransactionInterface)[];
  setShownFields: Dispatch<SetStateAction<(keyof TransactionInterface)[]>>;
  params: URLSearchParams;
  setParams: SetURLSearchParams;
  pageDetails: PaginatedDetails | undefined;
  itemMap: KV<any>[];
  PageBar: React.FC;
  fetchFcn: () => void;
  graph: Graph;
}

export const TransactionViewContext =
  createContext<TransactionViewProps | null>(null);

export const useTransactionView = () => {
  const ctx = useContext(TransactionViewContext);
  if (!ctx)
    throw new Error(
      "useTransactionView must be used within TransactionViewContext"
    );
  return ctx;
};
