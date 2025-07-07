export interface Option {
  id: number | string;
  name: string;
}

export type Page = {
  title: string;
  link?: string;
  selected?: boolean;
  onClick?: () => void;
  hidden?: boolean;
  children?: Page[];
};

export type Field = {
  name: string;
  label: string;
  type: string;
  options?: Option[];
  function?: (t: any) => any;
  centered?: boolean;
  infoType?: string;
};

export type MySpeedDialProps = {
  icon: any;
  name: string;
  onClick?: () => void;
  hidden?: boolean;
};

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
  currentPage: number;
  totalPages: number;
  ids: number[];
};

export type PaginatedDetails = Omit<PaginatedResponse<unknown>, "results">;

export type Graph = "line" | "pie";

export type StateSetter<T> = React.Dispatch<React.SetStateAction<T>>;

export type KeyboardCodes =
  | `Digit${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`
  | `Numpad${
      | 0
      | 1
      | 2
      | 3
      | 4
      | 5
      | 6
      | 7
      | 8
      | 9
      | "Decimal"
      | "Enter"
      | "Multiply"
      | "Divide"
      | "Add"
      | "Subtract"}`
  | `F${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`
  | `Arrow${"Up" | "Down" | "Left" | "Right"}`
  | `Key${
      | "A"
      | "B"
      | "C"
      | "D"
      | "E"
      | "F"
      | "G"
      | "H"
      | "I"
      | "J"
      | "K"
      | "L"
      | "M"
      | "N"
      | "O"
      | "P"
      | "Q"
      | "R"
      | "S"
      | "T"
      | "U"
      | "V"
      | "W"
      | "X"
      | "Y"
      | "Z"}`
  | `${"Alt" | "Bracket" | "Control" | "Shift" | "Meta"}${"Left" | "Right"}`
  | "Backquote"
  | "Quote"
  | "Backslash"
  | "Slash"
  | "Backspace"
  | "Space"
  | `${"Caps" | "Num" | "Scroll"}Lock`
  | "Comma"
  | "ContextMenu"
  | "Enter"
  | "Insert"
  | "Equal"
  | "Escape"
  | "Minus"
  | "Period"
  | "Semicolon"
  | "Tab";
