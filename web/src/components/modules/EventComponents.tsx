import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";
import { Event, EventInterface } from "../../api/EventStore";
import { useStore } from "../../api/Store";
import { MyCalendar } from "../../blueprints/MyCalendar";
import {
  IAction,
  MyGenericCard,
} from "../../blueprints/MyGenericComponents/MyGenericCard";
import { MyGenericCollection } from "../../blueprints/MyGenericComponents/MyGenericCollection";
import { MyGenericFilter } from "../../blueprints/MyGenericComponents/MyGenericFilter";
import { MyGenericForm } from "../../blueprints/MyGenericComponents/MyGenericForm";
import {
  createGenericContext,
  createGenericViewContext,
} from "../../blueprints/MyGenericComponents/MyGenericProps";
import { MyGenericRow } from "../../blueprints/MyGenericComponents/MyGenericRow";
import { MyGenericTable } from "../../blueprints/MyGenericComponents/MyGenericTable";
import {
  MyGenericView,
  useViewValues,
} from "../../blueprints/MyGenericComponents/MyGenericView";
import { IconName } from "../../blueprints/MyIcon";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { TwoDates } from "../../constants/classes";
import { sortAndFilterByIds, toOptions } from "../../constants/helpers";
import {
  CalendarProps,
  useCalendarProps,
  useVisible,
} from "../../constants/hooks";
import {
  ActionModalDef,
  CalendarView,
  Field,
  KV,
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
        item
          ? [
              {
                name: "excuse",
                label: "Excuse for Incompletion",
                type: "textarea",
              },
            ]
          : [],
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
      store={eventStore}
      datetimeFields={eventStore.datetimeFields}
      dateFields={eventStore.dateFields}
      timeFields={eventStore.timeFields}
    />
  );
};

export const EventCard = observer((props: { item: Event }) => {
  const { item } = props;
  const { fetchFcn, shownFields, itemMap, related } = useEventView();
  const { eventStore } = useStore();

  const moreActions = [
    {
      onClick: () =>
        eventStore.updateItem(item.id, {
          dateCompleted: item.dateCompleted ? null : new Date().toISOString(),
        }),
      icon: (item.dateCompleted
        ? item.excuse === ""
          ? "CheckBox"
          : "Warning"
        : "CheckBoxOutlineBlank") as IconName,
      color: item.dateCompleted ? "success" : "inherit",
    },
  ] satisfies IAction[];

  return (
    <MyGenericCard
      item={item}
      shownFields={
        shownFields.length
          ? shownFields
          : ["id", "title", "dateStart", "excuse"]
      }
      header={["id"]}
      important={["title"]}
      prices={eventStore.priceFields}
      FormComponent={EventForm}
      deleteItem={eventStore.deleteItem}
      fetchFcn={fetchFcn}
      moreActions={moreActions}
      itemMap={itemMap}
      related={related}
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
    const { eventStore } = useStore();
    const { pageDetails } = useEventView();

    return (
      <MyCalendar
        {...props}
        noIcon
        events={sortAndFilterByIds(
          eventStore.items,
          pageDetails?.ids ?? eventStore.items.map((s) => s.id),
          (s) => s.id
        ).filter((s) => !s.isArchived)}
      />
    );
  }
);

export const EventDisplay = observer(
  (props: { calendarProps: CalendarProps }) => {
    const { calendarProps } = props;
    return <EventDashboard {...calendarProps} />;
  }
);

export const EventCollection = observer(() => {
  const { eventStore } = useStore();
  const { PageBar, pageDetails } = useEventView();
  const values = useMoreEventView();
  const { date } = values;

  return (
    <>
      <SideBySideView
        SideA={
          <MyGenericCollection
            CardComponent={EventCard}
            title={title}
            pageDetails={pageDetails}
            PageBar={PageBar}
            items={eventStore.items.filter(
              (s) =>
                !s.isArchived && new TwoDates(s.dateStart, date).isEqualDate
            )}
          />
        }
        SideB={<EventDashboard {...values} />}
        ratio={0.7}
      />
    </>
  );
});

export const EventFilter = observer(() => {
  const { eventStore } = useStore();
  return (
    <MyGenericFilter
      view={new Event({}).$view}
      title="Event Filters"
      dateFields={[...eventStore.dateFields, ...eventStore.datetimeFields]}
      relatedFields={eventStore.relatedFields}
      optionFields={eventStore.optionFields}
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
  const values = useEventView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={eventStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <EventRow item={item} />}
      priceFields={eventStore.priceFields}
      {...values}
    />
  );
});

export interface Props {
  date: Date;
  setDate: StateSetter<Date>;
  view: CalendarView;
  setView: StateSetter<CalendarView>;
  range: string;
}

export const { Context: MoreEventContext, useGeneric: useMoreEventView } =
  createGenericContext<Props>();

export const EventView = observer(() => {
  const { eventStore, settingStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<EventInterface, Event>(
    settingStore,
    "Event",
    new Event({})
  );
  const calendarProps = useCalendarProps();
  const { start, end } = calendarProps;
  const { params, setPageDetails, setParams } = values;

  const fetchFcn = async () => {
    if (!params.size) return;
    const resp = await eventStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  useEffect(() => {
    const newParams = new URLSearchParams({
      page: "all",
      date_start__gte: start.toISOString(),
      date_start__lte: end.toISOString(),
      order_by: "date_start",
    });
    setParams(newParams);
  }, [start.toISOString()]);

  const itemMap = useMemo(() => [] satisfies KV<any>[], []);

  const actionModalDefs = [] satisfies ActionModalDef[];

  return (
    <MoreEventContext.Provider value={calendarProps}>
      <MyGenericView<EventInterface>
        title={title}
        Context={EventViewContext}
        CollectionComponent={EventCollection}
        FormComponent={EventForm}
        FilterComponent={EventFilter}
        actionModalDefs={actionModalDefs}
        TableComponent={EventTable}
        related={eventStore.related}
        fetchFcn={fetchFcn}
        isVisible={isVisible}
        setVisible={setVisible}
        itemMap={itemMap}
        {...values}
      />
    </MoreEventContext.Provider>
  );
});
