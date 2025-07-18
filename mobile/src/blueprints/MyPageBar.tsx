import React from "react";
import { PaginatedDetails } from "../constants/interfaces";
import { Text, View } from "react-native";

export type MyPageBarProps = {
  pageDetails?: PaginatedDetails;
  onPressNext: () => void;
  onPressPrev: () => void;
  onPressPage: (page: number) => void;
  title: string;
};

export const MyPageBar: React.FC<MyPageBarProps> = ({
  pageDetails,
  onPressNext,
  onPressPrev,
  onPressPage,
  title,
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
    <View>
      {totalPages <= 1 ? (
        <></>
      ) : (
        <Text>{`Page ${currentPage} of ${totalPages} (${count} items)`}</Text>
      )}
      <Text>{title.toUpperCase()}</Text>
      <View>
        {currentPage === 1 ? (
          <></>
        ) : (
          <View>
            <Text onPress={onPressPrev}>Prev</Text>
          </View>
        )}
        {totalPages <= 1 ? (
          <></>
        ) : (
          getPageNumbers().map((item, index) => (
            <View key={index}>
              {typeof item === "number" ? (
                <Text onPress={() => onPressPage(item)}>{item}</Text>
              ) : (
                <Text>{item}</Text>
              )}
            </View>
          ))
        )}
        <View>
          {currentPage >= totalPages ? (
            <></>
          ) : (
            <Text onPress={onPressNext}>Next</Text>
          )}
        </View>
      </View>
    </View>
  );
};
