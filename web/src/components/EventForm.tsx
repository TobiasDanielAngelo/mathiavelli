import moment from "moment";
import { useMemo, useState } from "react";
import { EventInterface } from "../api/EventStore";
import { useStore } from "../api/Store";
import { MyForm } from "../blueprints/MyForm";
import { Field } from "../constants/interfaces";
import { toOptions } from "../constants/helpers";

export const EventForm = (props: {
  item?: EventInterface;
  setVisible?: (t: boolean) => void;
}) => {
  const { item, setVisible } = props;
  const { eventStore, tagStore } = useStore();
  const [details, setDetails] = useState<EventInterface>({
    title: item?.title,
    description: item?.description,
    start: moment(item?.start).format("MMM D YYYY h:mm A"),
    end: moment(item?.end).format("MMM D YYYY h:mm A"),
    allDay: item?.allDay,
    location: item?.location,
    tags: item?.tags ?? [],
    createdAt: item?.createdAt,
  });
  const [msg, setMsg] = useState<Object>();
  const [isLoading, setLoading] = useState(false);

  const rawFields = useMemo(
    () => [
      [
        {
          name: "title",
          label: "Title",
          type: "text",
        },
      ],
      [
        {
          name: "description",
          label: `Description (${details.description?.length ?? 0}/300)`,
          type: "textarea",
        },
      ],
      [
        {
          name: "start",
          label: "Date/Time Start",
          type: "datetime",
        },
        {
          name: "end",
          label: "Date/Time End",
          type: "datetime",
        },
      ],
      [
        {
          name: "allDay",
          label: "All Day?",
          type: "check",
        },
        {
          name: "location",
          label: "Location",
          type: "text",
        },
      ],
      [
        {
          name: "tags",
          label: "Tags",
          type: "multi",
          options: toOptions(tagStore.items, "name"),
        },
      ],
    ],
    [tagStore.items.length, details.description?.length]
  ) as Field[][];

  const onClickCreate = async () => {
    setLoading(true);
    const resp = await eventStore.addItem({
      ...details,
      createdAt: moment(details.createdAt, "MMM D YYYY h:mm A").toISOString(),
      start: moment(details.start, "MMM D YYYY h:mm A").toISOString(),
      end: moment(details.end, "MMM D YYYY h:mm A").toISOString(),
    });
    setLoading(false);

    if (!resp.ok) {
      setMsg(resp.details);
      return;
    }
    setVisible && setVisible(false);
  };

  const onClickEdit = async () => {
    if (!item?.id) return;
    setLoading(true);
    const resp = await eventStore.updateItem(item.id, {
      ...details,
      createdAt: moment(details.createdAt, "MMM D YYYY h:mm A").toISOString(),
      start: moment(details.start, "MMM D YYYY h:mm A").toISOString(),
      end: moment(details.end, "MMM D YYYY h:mm A").toISOString(),
    });
    setLoading(false);

    if (!resp.ok) {
      setMsg(resp.details);
      return;
    }
    setVisible && setVisible(false);
  };

  const onClickDelete = async () => {
    if (!item?.id) return;
    setLoading(true);
    const resp = await eventStore.deleteItem(item.id);
    setLoading(false);

    if (!resp.ok) {
      setMsg(resp.details);
      return;
    }
    setVisible && setVisible(false);
  };

  return (
    <div className="items-center">
      <MyForm
        fields={rawFields}
        title={item ? "Edit Event" : "Event Creation Form"}
        details={details}
        setDetails={setDetails}
        onClickSubmit={item ? onClickEdit : onClickCreate}
        hasDelete={!!item}
        onDelete={onClickDelete}
        objectName="event"
        msg={msg}
        isLoading={isLoading}
      />
    </div>
  );
};
