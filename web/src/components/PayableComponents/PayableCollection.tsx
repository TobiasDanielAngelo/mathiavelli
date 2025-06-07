import { observer } from "mobx-react-lite";
import { useStore } from "../../api/Store";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { PayableCard } from "./PayableCard";
import { usePayableView } from "./PayableProps";

export const PayableCollection = observer(() => {
  const { payableStore } = useStore();
  const { shownFields, pageDetails, PageBar } = usePayableView();

  return (
    <SideBySideView
      SideA={
        <div className="flex flex-col min-h-[85vh]">
          <PageBar />
          <div className="flex-1">
            {payableStore.items
              .filter((s) => pageDetails?.ids?.includes(s.id))
              .sort((a, b) => {
                return (
                  (pageDetails?.ids?.indexOf(a.id) ?? 0) -
                  (pageDetails?.ids?.indexOf(b.id) ?? 0)
                );
              })
              .map((s) => (
                <PayableCard item={s} key={s.id} shownFields={shownFields} />
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
