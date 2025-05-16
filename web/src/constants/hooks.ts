import { useEffect } from "react";
import { handleKeyDown } from "./helpers";

export const useKeyPress = (keys: string[], callbackFcn: () => void) => {
  return useEffect(() => {
    document.addEventListener("keydown", (e) =>
      handleKeyDown(e, keys, callbackFcn)
    );

    return () => {
      document.removeEventListener("keydown", (e) =>
        handleKeyDown(e, keys, () => callbackFcn)
      );
    };
  }, [callbackFcn]);
};

export const useFilterParams = (keys: string[], callbackFcn: () => void) => {
  return useEffect(() => {
    document.addEventListener("keydown", (e) =>
      handleKeyDown(e, keys, callbackFcn)
    );

    return () => {
      document.removeEventListener("keydown", (e) =>
        handleKeyDown(e, keys, () => callbackFcn)
      );
    };
  }, []);
};
