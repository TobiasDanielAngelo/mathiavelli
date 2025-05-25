import { Dispatch, PropsWithChildren, SetStateAction, useState } from "react";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { MySearch } from "./MySearch";

export const MyFilters = (
  props: PropsWithChildren<{
    active?: number;
    query?: string;
    setQuery?: Dispatch<SetStateAction<string>>;
  }>
) => {
  const { children, active, query, setQuery } = props;
  const [open, setOpen] = useState(true);
  const [search, setSearch] = useState(false);

  return (
    <div className="flex flex-col md:flex-row-reverse gap-3">
      <div className={open ? "" : "absolute right-0 top-0"}>
        <div
          className="flex items-center justify-end cursor-pointer"
          onClick={() => setOpen((t) => !t)}
        >
          {!open ? (
            <div className="pr-5 pt-5">
              <FilterAltIcon
                sx={{
                  fontSize: "40px",
                  color: "gray",
                }}
              />
              <div
                className="bg-red-400 rounded-full text-white -mt-3 text-sm ml-5"
                hidden={!active || active === 0}
              >
                {active ?? 0}
              </div>
            </div>
          ) : (
            <VisibilityOffIcon
              fontSize="large"
              sx={{
                fontSize: "40px",
                color: "gray",
              }}
              className="pr-2 pt-2"
            />
          )}
        </div>
      </div>
      {open ? (
        <div className="flex flex-col-reverse md:flex-row-reverse flex-1 gap-3 text-left px-6 pt-4">
          {setQuery ? (
            <MySearch
              query={query}
              setQuery={setQuery}
              open={search}
              setOpen={setSearch}
            />
          ) : (
            <></>
          )}
          {!search && children}
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};
