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
