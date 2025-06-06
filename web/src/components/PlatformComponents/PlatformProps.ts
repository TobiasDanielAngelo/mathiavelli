import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { SetURLSearchParams } from "react-router-dom";
import { PlatformInterface } from "../../api/PlatformStore";
import { PaginatedDetails } from "../../constants/interfaces";

interface PlatformViewProps {
  shownFields: (keyof PlatformInterface)[];
  setShownFields: Dispatch<SetStateAction<(keyof PlatformInterface)[]>>;
  params: URLSearchParams;
  setParams: SetURLSearchParams;
  pageDetails: PaginatedDetails | undefined;
  PageBar: React.FC;
  fetchFcn: () => void;
}

export const PlatformViewContext = createContext<PlatformViewProps | null>(
  null
);

export const usePlatformView = () => {
  const ctx = useContext(PlatformViewContext);
  if (!ctx)
    throw new Error("usePlatformView must be used within PlatformViewContext");
  return ctx;
};

export const PlatformIdMap = {
  Google: 1,
  GitHub: 2,
  Facebook: 3,
  Twitter: 4,
  Microsoft: 5,
  Apple: 6,
  Amazon: 7,
  Netflix: 8,
  Steam: 9,
  Spotify: 10,
} as const;
