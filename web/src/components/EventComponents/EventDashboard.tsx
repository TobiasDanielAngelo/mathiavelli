import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useStore } from "../../api/Store";
import { MyCalendar } from "../../blueprints/MyCalendar";
import { MyLockedCard } from "../../blueprints/MyLockedCard";

export const EventDashboard = observer(() => {
  const [date, setDate] = useState(new Date());
  const { eventStore } = useStore();

  return (
    <MyLockedCard isUnlocked>
      <MyCalendar date={date} setDate={setDate} events={eventStore.items} />
    </MyLockedCard>
  );
});
