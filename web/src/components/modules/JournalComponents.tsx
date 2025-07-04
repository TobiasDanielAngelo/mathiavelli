import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import {
  Journal,
  JournalFields,
  JournalInterface,
} from "../../api/JournalStore";
import { useStore } from "../../api/Store";
import { KV } from "../../blueprints/ItemDetails";
import { MyGenericCard } from "../../blueprints/MyGenericComponents/MyGenericCard";
import { MyGenericCollection } from "../../blueprints/MyGenericComponents/MyGenericCollection";
import { MyGenericFilter } from "../../blueprints/MyGenericComponents/MyGenericFilter";
import { MyGenericForm } from "../../blueprints/MyGenericComponents/MyGenericForm";
import { createGenericViewContext } from "../../blueprints/MyGenericComponents/MyGenericProps";
import { MyGenericRow } from "../../blueprints/MyGenericComponents/MyGenericRow";
import { MyGenericTable } from "../../blueprints/MyGenericComponents/MyGenericTable";
import {
  ActionModalDef,
  MyGenericView,
  useViewValues,
} from "../../blueprints/MyGenericComponents/MyGenericView";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { useVisible } from "../../constants/hooks";
import { Field } from "../../constants/interfaces";

export const { Context: JournalViewContext, useGenericView: useJournalView } =
  createGenericViewContext<JournalInterface>();

const title = "Journals";

export const JournalIdMap = {} as const;

export const JournalForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: Journal;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { journalStore } = useStore();

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
            label: "Journal Entry",
            type: "textarea",
          },
        ],
        [
          {
            name: "datetimeCreated",
            label: "Created",
            type: "datetime",
          },
        ],
      ] satisfies Field[][],
    []
  );

  return (
    <MyGenericForm<JournalInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="journal"
      fields={fields}
      store={journalStore}
      datetimeFields={JournalFields.datetimeFields}
      dateFields={JournalFields.dateFields}
      timeFields={JournalFields.timeFields}
    />
  );
};

export const JournalCard = observer((props: { item: Journal }) => {
  const { item } = props;
  const { fetchFcn, shownFields } = useJournalView();
  const { journalStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id", "datetimeCreated"]}
      important={["title"]}
      prices={JournalFields.pricesFields}
      FormComponent={JournalForm}
      deleteItem={journalStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const JournalDashboard = observer(() => {
  return <></>;
});

export const JournalCollection = observer(() => {
  const { journalStore } = useStore();
  const { pageDetails, PageBar } = useJournalView();

  return (
    <SideBySideView
      SideA={
        <MyGenericCollection
          CardComponent={JournalCard}
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={journalStore.items}
        />
      }
      SideB={<JournalDashboard />}
      ratio={0.7}
    />
  );
});

export const JournalFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new Journal({}).$view}
      title="Journal Filters"
      dateFields={[
        ...JournalFields.dateFields,
        ...JournalFields.datetimeFields,
      ]}
      excludeFields={["id"]}
      relatedFields={[]}
      optionFields={[]}
    />
  );
});

export const JournalRow = observer((props: { item: Journal }) => {
  const { item } = props;
  const { fetchFcn } = useJournalView();
  const { journalStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={JournalForm}
      deleteItem={journalStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const JournalTable = observer(() => {
  const { journalStore } = useStore();
  const values = useJournalView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={journalStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <JournalRow item={item} />}
      priceFields={JournalFields.pricesFields}
      {...values}
    />
  );
});

export const JournalView = observer(() => {
  const { journalStore, settingStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<JournalInterface, Journal>(
    settingStore,
    "Journal",
    new Journal({})
  );
  const { params, setPageDetails } = values;
  const fetchFcn = async () => {
    const resp = await journalStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(() => [] satisfies KV<any>[], []);

  const actionModalDefs = [] satisfies ActionModalDef[];

  return (
    <MyGenericView<JournalInterface>
      title={title}
      Context={JournalViewContext}
      CollectionComponent={JournalCollection}
      FormComponent={JournalForm}
      FilterComponent={JournalFilter}
      actionModalDefs={actionModalDefs}
      TableComponent={JournalTable}
      fetchFcn={fetchFcn}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
