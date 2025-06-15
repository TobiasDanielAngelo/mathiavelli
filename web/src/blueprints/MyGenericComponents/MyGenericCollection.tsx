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
  }) => {
    const { PageBar, items, pageDetails, CardComponent } = props;
    return (
      <div className="flex flex-col min-h-[85vh]">
        <PageBar />
        <div className="flex-1">
          {sortAndFilterByIds(items, pageDetails?.ids ?? [], (s) => s.id).map(
            (s) => (
              <CardComponent item={s} key={s.id} />
            )
          )}
        </div>
        <PageBar />
      </div>
    );
  }
);
