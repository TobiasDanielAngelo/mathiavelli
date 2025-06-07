import { observer } from "mobx-react-lite";
import { useStore } from "../../api/Store";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { ReceivableCard } from "../ReceivableComponents/ReceivableCard";
import { useReceivableView } from "./ReceivableProps";

export const ReceivableCollection = observer(() => {
  const { receivableStore } = useStore();
  const { shownFields, pageDetails, PageBar } = useReceivableView();

  return (
    <SideBySideView
      SideA={
        <div className="flex flex-col min-h-[85vh]">
          <PageBar />
          <div className="flex-1">
            {receivableStore.items
              .filter((s) => pageDetails?.ids?.includes(s.id))
              .sort((a, b) => {
                return (
                  (pageDetails?.ids?.indexOf(a.id) ?? 0) -
                  (pageDetails?.ids?.indexOf(b.id) ?? 0)
                );
              })
              .map((s) => (
                <ReceivableCard item={s} key={s.id} shownFields={shownFields} />
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
