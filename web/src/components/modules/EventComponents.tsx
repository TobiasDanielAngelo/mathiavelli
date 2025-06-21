import { observer } from "mobx-react-lite";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Event, EventFields, EventInterface } from "../../api/EventStore";
import { useStore } from "../../api/Store";
import { MyMultiDropdownSelector } from "../../blueprints";
import { KV } from "../../blueprints/ItemDetails";
import { CalendarView, MyCalendar } from "../../blueprints/MyCalendar";
import { MyGenericCard } from "../../blueprints/MyGenericComponents/MyGenericCard";
import { MyGenericCollection } from "../../blueprints/MyGenericComponents/MyGenericCollection";
import { MyGenericFilter } from "../../blueprints/MyGenericComponents/MyGenericFilter";
import { MyGenericForm } from "../../blueprints/MyGenericComponents/MyGenericForm";
import { createGenericViewContext } from "../../blueprints/MyGenericComponents/MyGenericProps";
import { MyGenericRow } from "../../blueprints/MyGenericComponents/MyGenericRow";
import { MyGenericTable } from "../../blueprints/MyGenericComponents/MyGenericTable";
import {
  ActionModalDef,
  GraphType,
  MyGenericView,
} from "../../blueprints/MyGenericComponents/MyGenericView";
import { MyLockedCard } from "../../blueprints/MyLockedCard";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { toOptions, toTitleCase } from "../../constants/helpers";
import { useLocalStorageState, useVisible } from "../../constants/hooks";
import {
  Field,
  PaginatedDetails,
  StateSetter,
} from "../../constants/interfaces";

export const { Context: EventViewContext, useGenericView: useEventView } =
  createGenericViewContext<EventInterface>();

const title = "Events";

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
            name: "dateStart",
            label: "Date/Time Start",
            type: "datetime",
          },
          {
            name: "dateEnd",
            label: "Date/Time End",
            type: "datetime",
          },
          {
            name: "dateCompleted",
            label: "Date/Time Completed",
            type: "datetime",
          },
        ],
        [
          {
            name: "isArchived",
            label: "Is Archived?",
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

export const EventDashboard = observer(
  (props: {
    date: Date;
    setDate: StateSetter<Date>;
    view: CalendarView;
    setView: StateSetter<CalendarView>;
    range: string;
  }) => {
    const { range } = props;
    const { eventStore } = useStore();

    useEffect(() => {
      eventStore.fetchMissingEvents(`range=${range}`);
    }, [range]);

    return (
      <MyLockedCard isUnlocked>
        <MyCalendar {...props} events={eventStore.items} />
      </MyLockedCard>
    );
  }
);

export const EventCollection = observer(() => {
  const { eventStore } = useStore();
  const { PageBar } = useEventView();
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");

  const range =
    view === "month"
      ? moment(date).format("YYYY-MM")
      : view === "year"
      ? moment(date).format("YYYY")
      : `${Math.floor(moment(date).year() / 10)}X`;

  const filteredItems = eventStore.items.filter((s) => {
    const m = moment(s.dateStart);
    if (view === "month") return m.format("YYYY-MM") === range;
    if (view === "year") return m.format("YYYY") === range;
    if (view === "decade") return `${Math.floor(m.year() / 10)}X` === range;
    return false;
  });

  const values = {
    date,
    setDate,
    view,
    setView,
    range,
  };
  return (
    <>
      <SideBySideView
        SideA={
          <MyGenericCollection
            CardComponent={EventCard}
            title={title}
            pageDetails={undefined}
            PageBar={PageBar}
            items={filteredItems}
          />
        }
        SideB={<EventDashboard {...values} />}
        ratio={0.7}
      />
    </>
  );
});

export const EventFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new Event({}).$view}
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
  const {
    shownFields,
    params,
    setParams,
    pageDetails,
    PageBar,
    itemMap,
    sortFields,
    setSortFields,
  } = useEventView();

  return (
    <MyGenericTable
      items={eventStore.items}
      shownFields={shownFields}
      sortFields={sortFields}
      setSortFields={setSortFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <EventRow item={item} />}
      priceFields={EventFields.prices}
      itemMap={itemMap}
    />
  );
});

export const EventView = observer(() => {
  const { eventStore, tagStore } = useStore();
  const { setVisible1, isVisible, setVisible } = useVisible();
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const [params, setParams] = useSearchParams();
  const objWithFields = new Event({}).$view;
  const [graph, setGraph] = useState<GraphType>("pie");
  const [shownFields, setShownFields] = useLocalStorageState(
    Object.keys(objWithFields) as (keyof EventInterface)[],
    "shownFieldsEvent"
  );
  const [sortFields, setSortFields] = useLocalStorageState(
    [] as string[],
    "sortFieldsEvent"
  );
  const fetchFcn = async () => {
    const resp = await eventStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(
    () =>
      [
        {
          key: "tags",
          values: tagStore.items,
          label: "name",
        },
      ] satisfies KV<any>[],
    [tagStore.items.length]
  );

  const actionModalDefs = [
    {
      icon: "NoteAdd",
      label: "NEW",
      name: "Add a Event",
      modal: <EventForm fetchFcn={fetchFcn} setVisible={setVisible1} />,
    },
    {
      icon: "ViewList",
      label: "FIELDS",
      name: "Show Fields",
      modal: (
        <MyMultiDropdownSelector
          label="Fields"
          value={shownFields}
          onChangeValue={(t) => setShownFields(t as (keyof EventInterface)[])}
          options={Object.keys(objWithFields).map((s) => ({
            id: s,
            name: toTitleCase(s),
          }))}
          relative
          open
        />
      ),
    },
    {
      icon: "FilterListAlt",
      label: "FILTERS",
      name: "Filters",
      modal: <EventFilter />,
    },
  ] satisfies ActionModalDef[];

  return (
    <MyGenericView<EventInterface>
      title={title}
      fetchFcn={fetchFcn}
      actionModalDefs={actionModalDefs}
      isVisible={isVisible}
      setVisible={setVisible}
      Context={EventViewContext}
      CollectionComponent={EventCollection}
      TableComponent={EventTable}
      shownFields={shownFields}
      setShownFields={setShownFields}
      sortFields={sortFields}
      setSortFields={setSortFields}
      availableGraphs={["pie", "line"]}
      pageDetails={pageDetails}
      params={params}
      setParams={setParams}
      itemMap={itemMap}
      graph={graph}
      setGraph={setGraph}
    />
  );
});
