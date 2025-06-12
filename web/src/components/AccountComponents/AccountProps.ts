import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { SetURLSearchParams } from "react-router-dom";
import { AccountInterface } from "../../api/AccountStore";
import { PaginatedDetails } from "../../constants/interfaces";

interface AccountViewProps {
  shownFields: (keyof AccountInterface)[];
  setShownFields: Dispatch<SetStateAction<(keyof AccountInterface)[]>>;
  params: URLSearchParams;
  setParams: SetURLSearchParams;
  pageDetails: PaginatedDetails | undefined;
  PageBar: React.FC;
  fetchFcn: () => void;
}

export const AccountViewContext = createContext<AccountViewProps | null>(null);

export const useAccountView = () => {
  const ctx = useContext(AccountViewContext);
  if (!ctx)
    throw new Error("useAccountView must be used within AccountViewContext");
  return ctx;
};

export const AccountIdMap = {
  Wallet: 1000001,
  Coins: 1000002,
  Operations: 1000003,
  Initial: 1000004,
} as const;
