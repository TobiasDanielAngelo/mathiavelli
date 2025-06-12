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
  Google: 1000001,
  GitHub: 1000002,
  Facebook: 1000003,
  Twitter: 1000004,
  Microsoft: 1000005,
  Apple: 1000006,
  Amazon: 1000007,
  Netflix: 1000008,
  Steam: 1000009,
  Spotify: 1000010,
} as const;
