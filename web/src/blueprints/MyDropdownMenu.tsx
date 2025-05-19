import { useClickAway } from "@uidotdev/usehooks";
import { Page } from "../constants/interfaces";

export const MyDropdownMenu = (props: {
  open?: boolean;
  setOpen?: (t: boolean) => void;
  pages?: Page[];
}) => {
  const { open, pages, setOpen } = props;
  const ref = useClickAway<HTMLDivElement>(() => setOpen && setOpen(false));

  return (
    <div
      ref={ref}
      className={`${
        !open ? "hidden" : ""
      } absolute -mx-20 my-6 z-10 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700`}
    >
      <ul className="py-2">
        {pages?.map((s, ind) => (
          <li key={ind} onClick={s.onClick}>
            <a
              href={s.link}
              className="cursor-pointer block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
            >
              {s.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
