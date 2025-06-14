import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { SetURLSearchParams } from "react-router-dom";
import { Graph, PaginatedDetails } from "../../constants/interfaces";
import { KV } from "../ItemDetails";

interface GenericViewProps<T> {
  shownFields: (keyof T)[];
  setShownFields: Dispatch<SetStateAction<(keyof T)[]>>;
  params: URLSearchParams;
  setParams: SetURLSearchParams;
  pageDetails: PaginatedDetails | undefined;
  PageBar: React.FC;
  fetchFcn: () => void;
  itemMap?: KV<any>[];
  graph?: Graph;
}

export function createGenericViewContext<T>() {
  const Context = createContext<GenericViewProps<T> | null>(null);

  const useGenericView = () => {
    const ctx = useContext(Context);
    if (!ctx)
      throw new Error("useGenericView must be used within its provider");
    return ctx;
  };

  return { Context, useGenericView };
}
