import { useEffect, useState } from "react";
import { handleKeyDown } from "./helpers";

export const useKeyPress = (keys: string[], callbackFcn: () => void) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (keys.includes(e.key)) {
        callbackFcn();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [keys, callbackFcn]);
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

export const useWindowWidth = () => {
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
};
