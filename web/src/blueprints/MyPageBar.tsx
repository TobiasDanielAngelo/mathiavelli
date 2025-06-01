import React from "react";
import { PaginatedDetails } from "../constants/interfaces";

export type MyPageBarProps = {
  pageDetails?: PaginatedDetails;
  onClickNext: () => void;
  onClickPrev: () => void;
  onClickPage: (page: number) => void;
};

export const MyPageBar: React.FC<MyPageBarProps> = ({
  pageDetails,
  onClickNext,
  onClickPrev,
  onClickPage,
}) => {
  if (!pageDetails) return <></>;
  const { currentPage, totalPages, count } = pageDetails;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const left = Math.max(2, currentPage - 1);
      const right = Math.min(totalPages - 1, currentPage + 1);

      pages.push(1);
      if (left > 2) pages.push("...");

      for (let i = left; i <= right; i++) pages.push(i);

      if (right < totalPages - 1) pages.push("...");

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav className="flex items-center flex-column flex-wrap md:flex-row justify-between m-4">
      <span className="text-sm text-left font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 block w-full md:inline md:w-auto">
        Page{" "}
        <span className="font-semibold text-gray-900 dark:text-white">
          {currentPage}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-gray-900 dark:text-white">
          {totalPages}
        </span>{" "}
        ({count} items)
      </span>
      <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
        <li>
          <div
            onClick={onClickPrev}
            className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            Previous
          </div>
        </li>
        {getPageNumbers().map((item, index) => (
          <li key={index}>
            {typeof item === "number" ? (
              <div
                onClick={() => onClickPage(item)}
                className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 ${
                  item === currentPage
                    ? "text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:bg-gray-700 dark:border-gray-700 dark:text-white"
                    : "text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                }`}
              >
                {item}
              </div>
            ) : (
              <span className="flex items-center justify-center px-3 h-8 leading-tight text-gray-400 cursor-default">
                {item}
              </span>
            )}
          </li>
        ))}
        <li>
          <div
            onClick={onClickNext}
            className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            Next
          </div>
        </li>
      </ul>
    </nav>
  );
};
