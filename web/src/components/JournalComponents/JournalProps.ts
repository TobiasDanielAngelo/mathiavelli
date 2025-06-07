import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { SetURLSearchParams } from "react-router-dom";
import { JournalInterface } from "../../api/JournalStore";
import { PaginatedDetails } from "../../constants/interfaces";

interface JournalViewProps {
  shownFields: (keyof JournalInterface)[];
  setShownFields: Dispatch<SetStateAction<(keyof JournalInterface)[]>>;
  params: URLSearchParams;
  setParams: SetURLSearchParams;
  pageDetails: PaginatedDetails | undefined;
  PageBar: React.FC;
  fetchFcn: () => void;
}

export const JournalViewContext = createContext<JournalViewProps | null>(null);

export const useJournalView = () => {
  const ctx = useContext(JournalViewContext);
  if (!ctx)
    throw new Error("useJournalView must be used within JournalViewContext");
  return ctx;
};
