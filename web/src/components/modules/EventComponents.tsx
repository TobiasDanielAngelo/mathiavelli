import { observer } from "mobx-react-lite";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { Event, EventFields, EventInterface } from "../../api/EventStore";
import { useStore } from "../../api/Store";
import { KV } from "../../blueprints/ItemDetails";
import { CalendarView, MyCalendar } from "../../blueprints/MyCalendar";
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
  ActionModalDef,
  MyGenericView,
  useViewValues,
} from "../../blueprints/MyGenericComponents/MyGenericView";
import { IconName } from "../../blueprints/MyIcon";
import { MyLockedCard } from "../../blueprints/MyLockedCard";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { sortAndFilterByIds, toOptions } from "../../constants/helpers";
import { useVisible } from "../../constants/hooks";
import { Field, StateSetter } from "../../constants/interfaces";
import { TwoDates } from "../../constants/classes";

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
      store={eventStore}
      datetimeFields={EventFields.datetimeFields}
      dateFields={EventFields.dateFields}
      timeFields={EventFields.timeFields}
    />
  );
};

export const EventCard = observer((props: { item: Event }) => {
  const { item } = props;
  const { fetchFcn, shownFields } = useEventView();
  const { eventStore } = useStore();

  const moreActions = [
    {
      onClick: () =>
        eventStore.updateItem(item.id, {
          dateCompleted: item.dateCompleted ? null : new Date().toISOString(),
        }),
      icon: (item.dateCompleted
        ? "CheckBox"
        : "CheckBoxOutlineBlank") as IconName,
      color: item.dateCompleted ? "success" : "inherit",
    },
  ] satisfies IAction[];

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id"]}
      important={["title"]}
      prices={EventFields.pricesFields}
      FormComponent={EventForm}
      deleteItem={eventStore.deleteItem}
      fetchFcn={fetchFcn}
      moreActions={moreActions}
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
      <MyLockedCard isUnlocked>
        <MyCalendar
          {...props}
          noIcon
          events={sortAndFilterByIds(
            eventStore.items,
            pageDetails?.ids ?? eventStore.items.map((s) => s.id),
            (s) => s.id
          ).filter((s) => !s.isArchived)}
        />
      </MyLockedCard>
    );
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
      relatedFields={[]}
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
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");
  const range =
    view === "month"
      ? moment(date).format("YYYY-MM")
      : view === "year"
      ? moment(date).format("YYYY")
      : "month";
  // : `${Math.floor(moment(date).year() / 10)}X`;

  const start = moment(date).startOf("day");
  const end = moment(date).endOf("day");

  const { setParams, setPageDetails } = values;

  const fetchFcn = async () => {
    const newParams = new URLSearchParams({
      page: "all",
      date_start__gte: start.toISOString(),
      date_start__lte: end.toISOString(),
      order_by: "date_start",
    });
    setParams(newParams);
    const resp = await eventStore.fetchAll(newParams.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  useEffect(() => {
    eventStore
      .fetchMissingEvents(
        `start=${start.toISOString()}&end=${end.toISOString()}`
      )
      .then(fetchFcn);
  }, [date]);

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

  const value = {
    date,
    setDate,
    view,
    setView,
    range,
  };

  return (
    <MoreEventContext.Provider value={value}>
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
