import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { SetURLSearchParams } from "react-router-dom";
import { PaginatedDetails } from "../../constants/interfaces";
import { KV } from "../ItemDetails";
import { GraphType } from "./MyGenericView";

export interface GenericViewProps<T> {
  shownFields: (keyof T)[];
  setShownFields: Dispatch<SetStateAction<(keyof T)[]>>;
  sortFields: string[];
  setSortFields: Dispatch<SetStateAction<string[]>>;
  params: URLSearchParams;
  setParams: SetURLSearchParams;
  pageDetails: PaginatedDetails | undefined;
  PageBar: React.FC;
  fetchFcn: () => void;
  itemMap: KV<any>[];
  graph?: GraphType;
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
