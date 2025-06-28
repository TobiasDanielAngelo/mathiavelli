import { observer } from "mobx-react-lite";
import { sortAndFilterByIds } from "../../constants/helpers";
import { PaginatedDetails } from "../../constants/interfaces";

export const MyGenericCollection = observer(
  <T extends { id: number } & object>(props: {
    PageBar: React.FC;
    pageDetails?: PaginatedDetails | undefined; // set page details to undefined if you don't want any filters
    items: T[];
    CardComponent: React.ComponentType<{
      item: T;
    }>;
    title: string;
  }) => {
    const { PageBar, items, pageDetails, CardComponent, title } = props;

    return (
      <div className="flex flex-col min-h-[85vh]">
        <div className="sticky font-bold top-0 z-10 text-lg border dark:border-gray-600 border-teal-400 p-2 text-center bg-teal-100 dark:bg-[#242424]">
          {title.toUpperCase()}
        </div>
        <PageBar />
        <div className="flex-1">
          {sortAndFilterByIds(
            items,
            pageDetails?.ids ?? items.map((s) => s.id),
            (s) => s.id
          ).map((s) => (
            <CardComponent item={s} key={s.id} />
          ))}
        </div>
      </div>
    );
  }
);
