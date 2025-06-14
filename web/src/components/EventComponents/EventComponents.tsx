import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { Event, EventFields, EventInterface } from "../../api/EventStore";
import { useStore } from "../../api/Store";
import { MyGenericCard } from "../../blueprints/MyGenericComponents/MyGenericCard";
import { MyGenericFilter } from "../../blueprints/MyGenericComponents/MyGenericFilter";
import { MyGenericForm } from "../../blueprints/MyGenericComponents/MyGenericForm";
import { createGenericViewContext } from "../../blueprints/MyGenericComponents/MyGenericProps";
import { MyGenericRow } from "../../blueprints/MyGenericComponents/MyGenericRow";
import { MyGenericTable } from "../../blueprints/MyGenericComponents/MyGenericTable";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { sortAndFilterByIds, toOptions } from "../../constants/helpers";
import { Field } from "../../constants/interfaces";
import { MyLockedCard } from "../../blueprints/MyLockedCard";
import { MyCalendar } from "../../blueprints/MyCalendar";

export const { Context: EventViewContext, useGenericView: useEventView } =
  createGenericViewContext<EventInterface>();

export const EventIdMap = {} as const;

export const EventForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: Event;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { eventStore, tagStore } = useStore();

  const fields = useMemo(
    () =>
      [
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
            label: `Description`,
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
            name: "createdAt",
            label: "Created At",
            type: "datetime",
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
      ] satisfies Field[][],
    [tagStore.items.length]
  );

  return (
    <MyGenericForm<EventInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="event"
      fields={fields}
      storeFns={{
        add: eventStore.addItem,
        update: eventStore.updateItem,
        delete: eventStore.deleteItem,
      }}
      datetimeFields={EventFields.datetime}
      dateFields={EventFields.date}
    />
  );
};

export const EventCard = observer((props: { item: Event }) => {
  const { item } = props;
  const { fetchFcn, shownFields } = useEventView();
  const { eventStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id"]}
      important={["title"]}
      body={["description", "tagsName", "dateDuration"]}
      prices={EventFields.prices}
      FormComponent={EventForm}
      deleteItem={eventStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const EventDashboard = observer(() => {
  const [date, setDate] = useState(new Date());
  const { eventStore } = useStore();

  return (
    <MyLockedCard isUnlocked>
      <MyCalendar date={date} setDate={setDate} events={eventStore.items} />
    </MyLockedCard>
  );
});

export const EventCollection = observer(() => {
  const { eventStore } = useStore();
  const { pageDetails, PageBar } = useEventView();

  return (
    <SideBySideView
      SideA={
        <div className="flex flex-col min-h-[85vh]">
          <PageBar />
          <div className="flex-1">
            {sortAndFilterByIds(
              eventStore.items,
              pageDetails?.ids ?? [],
              (s) => s.id
            ).map((s) => (
              <EventCard item={s} key={s.id} />
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

export const EventFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new Event({}).$}
      title="Event Filters"
      dateFields={[...EventFields.date, ...EventFields.datetime]}
      excludeFields={["id"]}
    />
  );
});

export const EventRow = observer((props: { item: Event }) => {
  const { item } = props;
  const { fetchFcn } = useEventView();
  const { eventStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={EventForm}
      deleteItem={eventStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const EventTable = observer(() => {
  const { eventStore } = useStore();
  const { shownFields, params, setParams, pageDetails, PageBar } =
    useEventView();

  return (
    <MyGenericTable
      items={eventStore.items}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <EventRow item={item} />}
      priceFields={EventFields.prices}
    />
  );
});
