import { Dispatch, SetStateAction, useEffect, useState } from "react";
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

export function useLocalStorageState<T>(defaultValue: T, key: string) {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState] as const;
}

type VisibleMap = Record<number, boolean>;
type Index = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

type UseVisibleMapReturn = {
  visible: VisibleMap;
  toggleVisible: (key: number) => void;
  setVisible: (key: number, value: boolean) => void;
} & {
  [K in Index as `setVisible${K}`]: Dispatch<SetStateAction<boolean>>;
} & {
  [K in Index as `isVisible${K}`]: boolean;
};

/**
 * useVisibleMap - Custom hook to manage multiple visibility states (1 to count).
 *
 * @param count - Positive integer. The hook creates keys 1 to `count`, each mapped to a boolean.
 *
 * @returns An object containing:
 * - `visible`: Record<number, boolean> — the visibility state of each key.
 * - `setVisible(key, value)`: Set a specific key's visibility.
 * - `toggleVisible(key)`: Toggle a specific key's visibility.
 * - `setVisible1`, `setVisible2`, ..., `setVisibleN`: Direct setters for each key for cleaner usage.
 *
 * Example:
 * const { visible, setVisible1, toggleVisible } = useVisibleMap(4);
 * setVisible1?.(true);       // Sets visible[1] = true
 * toggleVisible(2);          // Toggles visible[2]
 *
 * console.log(visible[1]);   // true
 */
export function useVisible(): UseVisibleMapReturn {
  const indices = Array.from({ length: 10 }, (_, i) => (i + 1) as Index);

  const initialMap = Object.fromEntries(
    indices.map((i) => [i, false])
  ) as VisibleMap;
  const [visible, setVisibleState] = useState<VisibleMap>(initialMap);

  const toggleVisible = (key: Index) =>
    setVisibleState((prev) => ({ ...prev, [key]: !prev[key] }));

  const setVisible = (key: Index, value: boolean) =>
    setVisibleState((prev) => ({ ...prev, [key]: value }));

  const individualSetters = Object.fromEntries(
    indices.map((i) => {
      const setter: Dispatch<SetStateAction<boolean>> = (value) => {
        setVisibleState((prev) => ({
          ...prev,
          [i]: typeof value === "function" ? (value as any)(prev[i]) : value,
        }));
      };
      return [`setVisible${i}`, setter];
    })
  );

  const isVisibleMap = Object.fromEntries(
    indices.map((i) => [`isVisible${i}`, visible[i]])
  );

  return {
    visible,
    toggleVisible,
    setVisible,
    ...individualSetters,
    ...isVisibleMap,
  } as UseVisibleMapReturn;
}
