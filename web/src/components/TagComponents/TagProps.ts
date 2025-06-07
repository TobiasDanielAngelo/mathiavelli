import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { SetURLSearchParams } from "react-router-dom";
import { TagInterface } from "../../api/TagStore";
import { PaginatedDetails } from "../../constants/interfaces";

interface TagViewProps {
  shownFields: (keyof TagInterface)[];
  setShownFields: Dispatch<SetStateAction<(keyof TagInterface)[]>>;
  params: URLSearchParams;
  setParams: SetURLSearchParams;
  pageDetails: PaginatedDetails | undefined;
  PageBar: React.FC;
  fetchFcn: () => void;
}

export const TagViewContext = createContext<TagViewProps | null>(null);

export const useTagView = () => {
  const ctx = useContext(TagViewContext);
  if (!ctx) throw new Error("useTagView must be used within TagViewContext");
  return ctx;
};
