import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";
import { Event, EventFields, EventInterface } from "../../api/EventStore";
import { useStore } from "../../api/Store";
import { KV, ActionModalDef, CalendarView } from "../../constants/interfaces";
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
import { Field, StateSetter } from "../../constants/interfaces";
import { MyCalendar } from "../../blueprints/MyCalendar";

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
      datetimeFields={EventFields.datetimeFields}
      dateFields={EventFields.dateFields}
      timeFields={EventFields.timeFields}
    />
  );
};

export const EventCard = observer((props: { item: Event }) => {
  const { item } = props;
  const { fetchFcn, shownFields, itemMap } = useEventView();
  const { eventStore } = useStore();

  const moreActions = [
    {
      onPress: () =>
        eventStore.updateItem(item.id, {
          dateCompleted: item.dateCompleted ? null : new Date().toISOString(),
        }),
      icon: (item.dateCompleted
        ? item.excuse === ""
          ? "check-square"
          : "exclamation"
        : "square") as IconName,
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
      prices={EventFields.pricesFields}
      FormComponent={EventForm}
      deleteItem={eventStore.deleteItem}
      fetchFcn={fetchFcn}
      moreActions={moreActions}
      itemMap={itemMap}
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

    return <MyCalendar {...props} />;
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
  return (
    <MyGenericFilter
      view={new Event({}).$view}
      title="Event Filters"
      dateFields={[...EventFields.dateFields, ...EventFields.datetimeFields]}
      excludeFields={["id"]}
      relatedFields={["tagsName", "taskTitle"]}
      optionFields={[]}
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
      priceFields={EventFields.pricesFields}
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
  const { eventStore, tagStore, taskStore, settingStore } = useStore();
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

  const itemMap = useMemo(
    () =>
      [
        {
          key: "tags",
          values: tagStore.items,
          label: "name",
        },
        {
          key: "task",
          values: taskStore.items,
          label: "title",
        },
      ] satisfies KV<any>[],
    [tagStore.items.length, taskStore.items.length]
  );

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
        fetchFcn={fetchFcn}
        isVisible={isVisible}
        setVisible={setVisible}
        itemMap={itemMap}
        {...values}
      />
    </MoreEventContext.Provider>
  );
});
