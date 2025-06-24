import { createContext, useContext } from "react";
import { SetURLSearchParams } from "react-router-dom";
import { PaginatedDetails, StateSetter } from "../../constants/interfaces";
import { KV } from "../ItemDetails";
import { GraphType } from "./MyGenericView";

export interface GenericViewProps<T> {
  shownFields: (keyof T)[];
  setShownFields: StateSetter<(keyof T)[]>;
  sortFields: string[];
  setSortFields: StateSetter<string[]>;
  params: URLSearchParams;
  setParams: SetURLSearchParams;
  pageDetails: PaginatedDetails | undefined;
  setPageDetails: StateSetter<PaginatedDetails | undefined>;
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

export function createGenericContext<T>() {
  const Context = createContext<T | null>(null);

  const useGeneric = () => {
    const ctx = useContext(Context);
    if (!ctx) throw new Error("useGeneric must be used within its provider");
    return ctx;
  };

  return { Context, useGeneric };
}
