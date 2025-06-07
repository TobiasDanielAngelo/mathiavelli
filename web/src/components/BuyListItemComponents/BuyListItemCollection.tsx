import { observer } from "mobx-react-lite";
import { useStore } from "../../api/Store";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { BuyListItemCard } from "./BuyListItemCard";
import { useBuyListItemView } from "./BuyListItemProps";

export const BuyListItemCollection = observer(() => {
  const { buyListItemStore } = useStore();
  const { shownFields, pageDetails, PageBar } = useBuyListItemView();

  return (
    <SideBySideView
      SideA={
        <div className="flex flex-col min-h-[85vh]">
          <PageBar />
          <div className="flex-1">
            {buyListItemStore.items
              .filter((s) => pageDetails?.ids?.includes(s.id))
              .sort((a, b) => {
                return (
                  (pageDetails?.ids?.indexOf(a.id) ?? 0) -
                  (pageDetails?.ids?.indexOf(b.id) ?? 0)
                );
              })
              .map((s) => (
                <BuyListItemCard
                  item={s}
                  key={s.id}
                  shownFields={shownFields}
                />
              ))}
          </div>
          <PageBar />
        </div>
      }
      SideB=""
      ratio={0.7}
    />
  );
});
