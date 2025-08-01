import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { useStore } from "../../api/Store";
import {
  PRIORITY_CHOICES,
  STATUS_CHOICES,
  Ticket,
  TicketInterface,
} from "../../api/TicketStore";
import { MyGenericCard } from "../../blueprints/MyGenericComponents/MyGenericCard";
import { MyGenericCollection } from "../../blueprints/MyGenericComponents/MyGenericCollection";
import { MyGenericFilter } from "../../blueprints/MyGenericComponents/MyGenericFilter";
import { MyGenericForm } from "../../blueprints/MyGenericComponents/MyGenericForm";
import { createGenericViewContext } from "../../blueprints/MyGenericComponents/MyGenericProps";
import { MyGenericRow } from "../../blueprints/MyGenericComponents/MyGenericRow";
import { MyGenericTable } from "../../blueprints/MyGenericComponents/MyGenericTable";
import {
  MyGenericView,
  useViewValues,
} from "../../blueprints/MyGenericComponents/MyGenericView";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { toOptions } from "../../constants/helpers";
import { useVisible } from "../../constants/hooks";
import { ActionModalDef, Field, KV } from "../../constants/interfaces";

export const { Context: TicketViewContext, useGenericView: useTicketView } =
  createGenericViewContext<TicketInterface>();

const title = "Tickets";

export const TicketIdMap = {} as const;

export const TicketForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: Partial<Ticket>;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { ticketStore, userStore } = useStore();

  const fields = useMemo(
    () =>
      [
        [{ name: "title", label: "Title", type: "text" }],
        [{ name: "tags", label: "Tags", type: "multi" }],
        [{ name: "description", label: "Description", type: "textarea" }],
        [
          {
            name: "status",
            label: "Status",
            type: "select",
            options: toOptions(STATUS_CHOICES),
          },
        ],
        [
          {
            name: "priority",
            label: "Priority",
            type: "select",
            options: toOptions(PRIORITY_CHOICES),
          },
        ],
        [
          {
            name: "assignedTo",
            label: "Assigned To",
            type: "select",
            options: toOptions(userStore.items, "fullName"),
          },
        ],
      ] satisfies Field[][],
    [userStore.items.length]
  );

  return (
    <MyGenericForm<TicketInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="ticket"
      fields={fields}
      store={ticketStore}
      datetimeFields={ticketStore.datetimeFields}
      dateFields={ticketStore.dateFields}
      timeFields={ticketStore.timeFields}
    />
  );
};

export const TicketCard = observer((props: { item: Ticket }) => {
  const { item } = props;
  const { fetchFcn, shownFields, itemMap, related } = useTicketView();
  const { ticketStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id"]}
      important={[]}
      prices={ticketStore.priceFields}
      FormComponent={TicketForm}
      deleteItem={ticketStore.deleteItem}
      fetchFcn={fetchFcn}
      itemMap={itemMap}
      related={related}
    />
  );
});

export const TicketDashboard = observer(() => {
  return <></>;
});

export const TicketCollection = observer(() => {
  const { ticketStore } = useStore();
  const { pageDetails, PageBar } = useTicketView();

  return (
    <SideBySideView
      SideA={
        <MyGenericCollection
          CardComponent={TicketCard}
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={ticketStore.items}
        />
      }
      SideB={<TicketDashboard />}
      ratio={0.7}
    />
  );
});

export const TicketFilter = observer(() => {
  const { ticketStore } = useStore();
  return (
    <MyGenericFilter
      view={new Ticket({}).$view}
      title="Ticket Filters"
      dateFields={[...ticketStore.datetimeFields, ...ticketStore.dateFields]}
      relatedFields={ticketStore.relatedFields}
      optionFields={ticketStore.optionFields}
    />
  );
});

export const TicketRow = observer((props: { item: Ticket }) => {
  const { item } = props;
  const { fetchFcn } = useTicketView();
  const { ticketStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={TicketForm}
      deleteItem={ticketStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const TicketTable = observer(() => {
  const { ticketStore } = useStore();
  const values = useTicketView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={ticketStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <TicketRow item={item} />}
      priceFields={ticketStore.priceFields}
      {...values}
    />
  );
});

export const TicketView = observer(() => {
  const { ticketStore, settingStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<TicketInterface, Ticket>(
    settingStore,
    "Ticket",
    new Ticket({})
  );
  const { params, setPageDetails } = values;
  const fetchFcn = async () => {
    const resp = await ticketStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(() => [] satisfies KV<any>[], []);

  const actionModalDefs = [] satisfies ActionModalDef[];

  return (
    <MyGenericView<TicketInterface>
      title={title}
      Context={TicketViewContext}
      CollectionComponent={TicketCollection}
      FormComponent={TicketForm}
      FilterComponent={TicketFilter}
      actionModalDefs={actionModalDefs}
      TableComponent={TicketTable}
      related={ticketStore.related}
      fetchFcn={fetchFcn}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
