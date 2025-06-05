import { observer } from "mobx-react-lite";
import { useStore } from "../../api/Store";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { EventCard } from "./EventCard";
import { useEventView } from "./EventProps";
import { MyCalendar } from "../../blueprints/MyCalendar";
import { useState } from "react";

export const EventCollection = observer(() => {
  const { eventStore } = useStore();
  const { shownFields, pageDetails, PageBar } = useEventView();
  const [date, setDate] = useState(new Date());

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
      SideB={
        <MyCalendar date={date} setDate={setDate} events={eventStore.items} />
      }
      ratio={0.7}
    />
  );
});
