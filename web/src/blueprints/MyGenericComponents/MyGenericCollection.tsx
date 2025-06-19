import { observer } from "mobx-react-lite";
import { sortAndFilterByIds } from "../../constants/helpers";
import { PaginatedDetails } from "../../constants/interfaces";

export const MyGenericCollection = observer(
  <T extends { id: number } & object>(props: {
    PageBar: React.FC;
    pageDetails: PaginatedDetails | undefined;
    items: T[];
    CardComponent: React.ComponentType<{
      item: T;
    }>;
    title: string;
  }) => {
    const { PageBar, items, pageDetails, CardComponent, title } = props;

    return (
      <div className="flex flex-col min-h-[85vh]">
        <div className="sticky font-bold top-0 z-10 text-lg border border-gray-600  p-2 text-center bg-[#242424]">
          {title.toUpperCase()}
        </div>
        <PageBar />
        <div className="flex-1">
          {sortAndFilterByIds(items, pageDetails?.ids ?? [], (s) => s.id).map(
            (s) => (
              <CardComponent item={s} key={s.id} />
            )
          )}
        </div>
      </div>
    );
  }
);
