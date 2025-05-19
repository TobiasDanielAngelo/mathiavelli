import AddCardIcon from "@mui/icons-material/AddCard";
import CloseIcon from "@mui/icons-material/Close";
import { observer } from "mobx-react-lite";
import moment from "moment";
import { useMemo, useState } from "react";
import { EventInterface } from "../api/EventStore";
import { useStore } from "../api/Store";
import { MyCalendar } from "../blueprints/MyCalendar";
import { MyConfirmModal } from "../blueprints/MyConfirmModal";
import { MyModal } from "../blueprints/MyModal";
import { MySpeedDial } from "../blueprints/MySpeedDial";
import { sortByKey } from "../constants/helpers";
import { EventForm } from "./EventForm";
import { TagForm } from "./TagForm";

export const EventItem = observer((props: { item?: EventInterface }) => {
  const { item } = props;
  const [isVisible1, setVisible1] = useState(false);
  const [isVisible2, setVisible2] = useState(false);
  const [msg, setMsg] = useState("");
  const { eventStore } = useStore();

  const onDelete = async () => {
    const resp = await eventStore.deleteItem(item?.id ?? -1);
    if (!resp.ok) {
      setMsg(resp.details);
      return;
    }
    setVisible1(false);
  };

  return (
    <div className="flex justify-between m-2 border border-gray-500 rounded-lg p-2">
      <MyModal isVisible={isVisible1} setVisible={setVisible1}>
        <EventForm item={item} setVisible={setVisible1} />
      </MyModal>
      <MyConfirmModal
        isVisible={isVisible2}
        setVisible={setVisible2}
        onClickCheck={onDelete}
        actionName="Delete"
        msg={msg}
      />
      <div className="flex-1 mx-5">
        <div className="flex flex-row gap-1 text-xs text-left text-gray-400">
          <div>({moment(item?.start).format("MMM D")}</div>
          <div>to</div>
          <div>{moment(item?.end).format("MMM D")})</div>
        </div>
        <div
          className="hover:underline cursor-pointer"
          onClick={() => setVisible1(true)}
        >
          {item?.title}
        </div>
        <div className=" text-xs text-gray-400">{item?.description}</div>
      </div>
      <CloseIcon
        onClick={() => setVisible2(true)}
        className="cursor-pointer"
        fontSize="small"
      />
    </div>
  );
});

export const EventView = observer(() => {
  const [isVisible1, setVisible1] = useState(false);
  const [isVisible2, setVisible2] = useState(false);
  const [date, setDate] = useState(new Date());

  const { eventStore } = useStore();

  const actions = useMemo(
    () => [
      {
        icon: <AddCardIcon />,
        name: "Add an Event",
        onClick: () => setVisible1(true),
      },
      {
        icon: <AddCardIcon />,
        name: "Add a Tag",
        onClick: () => setVisible2(true),
      },
    ],
    []
  );

  return (
    <div className="lg:w-3/4 m-auto justify-center flex lg:flex-row flex-col-reverse max-h-[85vh] overflow-scroll">
      <div className="lg:w-1/3">
        {sortByKey(eventStore.items, "createdAt").map((s) => (
          <EventItem item={s} key={s.id} />
        ))}
      </div>
      <div className="lg:w-2/3">
        <MyCalendar date={date} setDate={setDate} events={eventStore.items} />
      </div>
      <MyModal isVisible={isVisible1} setVisible={setVisible1} disableClose>
        <EventForm setVisible={setVisible1} />
      </MyModal>
      <MyModal isVisible={isVisible2} setVisible={setVisible2} disableClose>
        <TagForm setVisible={setVisible2} />
      </MyModal>
      <MySpeedDial actions={actions} />
    </div>
  );
});
