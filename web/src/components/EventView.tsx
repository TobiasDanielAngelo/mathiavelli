import AddCardIcon from "@mui/icons-material/AddCard";
import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { useStore } from "../api/Store";
import { MyCalendar } from "../blueprints/MyCalendar";
import { MyModal } from "../blueprints/MyModal";
import { MySpeedDial } from "../blueprints/MySpeedDial";
import { sortByKey, toTitleCase } from "../constants/helpers";
import { EventForm } from "./EventForm";
import { EventItem } from "./EventItem";
import { TagForm } from "./TagForm";
import { SideBySideView } from "../blueprints/SideBySideView";
import { MyMultiDropdownSelector } from "../blueprints/MyMultiDropdownSelector";
import { Event, EventInterface } from "../api/EventStore";

export const EventView = observer(() => {
  const [isVisible1, setVisible1] = useState(false);
  const [isVisible2, setVisible2] = useState(false);
  const [isVisible3, setVisible3] = useState(false);
  const [date, setDate] = useState(new Date());
  const [shownFields, setShownFields] = useState<(keyof EventInterface)[]>(
    Object.keys(new Event({}).$) as (keyof EventInterface)[]
  );

  const { eventStore } = useStore();

  const actions = useMemo(
    () => [
      {
        icon: (
          <div className="flex flex-col items-center">
            <AddCardIcon fontSize="large" />
            <div className="text-xs text-gray-500 font-bold">EVENT</div>
          </div>
        ),
        name: "Add an Event",
        onClick: () => setVisible1(true),
      },
      {
        icon: (
          <div className="flex flex-col items-center">
            <AddCardIcon fontSize="large" />
            <div className="text-xs text-gray-500 font-bold">TAG</div>
          </div>
        ),
        name: "Add a Tag",
        onClick: () => setVisible2(true),
      },
      {
        icon: (
          <div className="flex flex-col items-center">
            <AddCardIcon fontSize="large" />
            <div className="text-xs text-gray-500 font-bold">FIELDS</div>
          </div>
        ),
        name: "Filter Fields",
        onClick: () => setVisible3(true),
      },
    ],
    []
  );

  return (
    <>
      <MyModal isVisible={isVisible1} setVisible={setVisible1} disableClose>
        <EventForm setVisible={setVisible1} />
      </MyModal>
      <MyModal isVisible={isVisible2} setVisible={setVisible2} disableClose>
        <TagForm setVisible={setVisible2} />
      </MyModal>
      <MyModal isVisible={isVisible3} setVisible={setVisible3} disableClose>
        <MyMultiDropdownSelector
          label="Fields"
          value={shownFields}
          onChangeValue={(t) => setShownFields(t as (keyof EventInterface)[])}
          options={Object.keys(new Event({}).$).map((s) => ({
            id: s,
            name: toTitleCase(s),
          }))}
          relative
          open
        />
      </MyModal>
      <MySpeedDial actions={actions} />
      <SideBySideView
        SideA={sortByKey(eventStore.items, "createdAt").map((s) => (
          <EventItem item={s.$} key={s.id} shownFields={shownFields} />
        ))}
        SideB={<MyCalendar date={date} setDate={setDate} />}
        ratio={0.7}
      />
    </>
  );
});
