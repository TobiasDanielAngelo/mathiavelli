import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { SetURLSearchParams } from "react-router-dom";
import { CredentialInterface } from "../../api/CredentialStore";
import { KV } from "../../blueprints/ItemDetails";
import { PaginatedDetails } from "../../constants/interfaces";

interface CredentialViewProps {
  shownFields: (keyof CredentialInterface)[];
  setShownFields: Dispatch<SetStateAction<(keyof CredentialInterface)[]>>;
  params: URLSearchParams;
  setParams: SetURLSearchParams;
  pageDetails: PaginatedDetails | undefined;
  itemMap: KV<any>[];
  PageBar: React.FC;
  fetchFcn: () => void;
}

export const CredentialViewContext = createContext<CredentialViewProps | null>(
  null
);

export const useCredentialView = () => {
  const ctx = useContext(CredentialViewContext);
  if (!ctx)
    throw new Error(
      "useCredentialView must be used within CredentialViewContext"
    );
  return ctx;
};
