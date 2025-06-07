import { observer } from "mobx-react-lite";
import { useStore } from "../../api/Store";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { EventCard } from "./EventCard";
import { EventDashboard } from "./EventDashboard";
import { useEventView } from "./EventProps";

export const EventCollection = observer(() => {
  const { eventStore } = useStore();
  const { shownFields, pageDetails, PageBar } = useEventView();

  return (
    <SideBySideView
      SideA={
        <div className="flex flex-col min-h-[85vh]">
          <PageBar />
          <div className="flex-1">
            {eventStore.items
              .filter((s) => pageDetails?.ids?.includes(s.id))
              .sort((a, b) => {
                return (
                  (pageDetails?.ids?.indexOf(a.id) ?? 0) -
                  (pageDetails?.ids?.indexOf(b.id) ?? 0)
                );
              })
              .map((s) => (
                <EventCard item={s} key={s.id} shownFields={shownFields} />
              ))}
          </div>
          <PageBar />
        </div>
      }
      SideB={<EventDashboard />}
      ratio={0.7}
    />
  );
});
