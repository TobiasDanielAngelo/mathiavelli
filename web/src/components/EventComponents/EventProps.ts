import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { SetURLSearchParams } from "react-router-dom";
import { EventInterface } from "../../api/EventStore";
import { KV } from "../../blueprints/ItemDetails";
import { PaginatedDetails } from "../../constants/interfaces";

interface EventViewProps {
  shownFields: (keyof EventInterface)[];
  setShownFields: Dispatch<SetStateAction<(keyof EventInterface)[]>>;
  params: URLSearchParams;
  setParams: SetURLSearchParams;
  pageDetails: PaginatedDetails | undefined;
  itemMap: KV<any>[];
  PageBar: React.FC;
}

export const EventViewContext = createContext<EventViewProps | null>(null);

export const useEventView = () => {
  const ctx = useContext(EventViewContext);
  if (!ctx)
    throw new Error("useEventView must be used within EventViewContext");
  return ctx;
};
