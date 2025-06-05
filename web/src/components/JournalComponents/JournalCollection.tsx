import { observer } from "mobx-react-lite";
import { useStore } from "../../api/Store";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { JournalCard } from "./JournalCard";
import { useJournalView } from "./JournalProps";
import { JournalForm } from "./JournalForm";

export const JournalCollection = observer(() => {
  const { journalStore } = useStore();
  const { shownFields, pageDetails, PageBar } = useJournalView();

  return (
    <SideBySideView
      SideB={
        <div className="flex flex-col min-h-[85vh]">
          <PageBar />
          <div className="flex-1">
            {journalStore.items
              .filter((s) => pageDetails?.ids?.includes(s.id))
              .sort((a, b) => {
                return (
                  (pageDetails?.ids?.indexOf(a.id) ?? 0) -
                  (pageDetails?.ids?.indexOf(b.id) ?? 0)
                );
              })
              .map((s) => (
                <JournalCard item={s} key={s.id} shownFields={shownFields} />
              ))}
          </div>
          <PageBar />
        </div>
      }
      SideA={<JournalForm />}
      ratio={0.7}
    />
  );
});
