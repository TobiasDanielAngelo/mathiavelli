import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { SetURLSearchParams } from "react-router-dom";
import { CategoryInterface } from "../../api/CategoryStore";
import { PaginatedDetails } from "../../constants/interfaces";

interface CategoryViewProps {
  shownFields: (keyof CategoryInterface)[];
  setShownFields: Dispatch<SetStateAction<(keyof CategoryInterface)[]>>;
  params: URLSearchParams;
  setParams: SetURLSearchParams;
  pageDetails: PaginatedDetails | undefined;
  PageBar: React.FC;
  fetchFcn: () => void;
}

export const CategoryViewContext = createContext<CategoryViewProps | null>(
  null
);

export const useCategoryView = () => {
  const ctx = useContext(CategoryViewContext);
  if (!ctx)
    throw new Error("useCategoryView must be used within CategoryViewContext");
  return ctx;
};

export const CategoryIdMap = {
  "Receivable Payment": 1,
  "Payable Payment": 2,
} as const;
