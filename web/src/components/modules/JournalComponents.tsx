import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Journal,
  JournalFields,
  JournalInterface,
} from "../../api/JournalStore";
import { useStore } from "../../api/Store";
import { MyMultiDropdownSelector } from "../../blueprints";
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
} from "../../blueprints/MyGenericComponents/MyGenericView";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { toTitleCase } from "../../constants/helpers";
import { useLocalStorageState, useVisible } from "../../constants/hooks";
import { Field, PaginatedDetails } from "../../constants/interfaces";

export const { Context: JournalViewContext, useGenericView: useJournalView } =
  createGenericViewContext<JournalInterface>();

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
      storeFns={{
        add: journalStore.addItem,
        update: journalStore.updateItem,
        delete: journalStore.deleteItem,
      }}
      datetimeFields={JournalFields.datetime}
      dateFields={JournalFields.date}
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
      header={["datetimeCreated"]}
      important={["title"]}
      body={["description"]}
      prices={JournalFields.prices}
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
      dateFields={[...JournalFields.date, ...JournalFields.datetime]}
      excludeFields={["id"]}
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
  const { shownFields, params, setParams, pageDetails, PageBar, itemMap } =
    useJournalView();

  return (
    <MyGenericTable
      items={journalStore.items}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <JournalRow item={item} />}
      priceFields={JournalFields.prices}
      itemMap={itemMap}
    />
  );
});

export const JournalView = observer(() => {
  const { journalStore } = useStore();
  const { setVisible1, isVisible, setVisible } = useVisible();
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const [params, setParams] = useSearchParams();
  const objWithFields = new Journal({}).$;
  const [shownFields, setShownFields] = useLocalStorageState(
    Object.keys(objWithFields) as (keyof JournalInterface)[],
    "shownFieldsJournal"
  );
  const fetchFcn = async () => {
    const resp = await journalStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(() => [] satisfies KV<any>[], []);

  const actionModalDefs = [
    {
      icon: "NoteAdd",
      label: "NEW",
      name: "Add a Journal",
      modal: <JournalForm fetchFcn={fetchFcn} setVisible={setVisible1} />,
    },
    {
      icon: "ViewList",
      label: "FIELDS",
      name: "Show Fields",
      modal: (
        <MyMultiDropdownSelector
          label="Fields"
          value={shownFields}
          onChangeValue={(t) => setShownFields(t as (keyof JournalInterface)[])}
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
      modal: <JournalFilter />,
    },
  ] satisfies ActionModalDef[];

  return (
    <MyGenericView<JournalInterface>
      fetchFcn={fetchFcn}
      actionModalDefs={actionModalDefs}
      isVisible={isVisible}
      setVisible={setVisible}
      Context={JournalViewContext}
      CollectionComponent={JournalCollection}
      TableComponent={JournalTable}
      shownFields={shownFields}
      setShownFields={setShownFields}
      availableGraphs={["pie", "line"]}
      pageDetails={pageDetails}
      params={params}
      setParams={setParams}
      itemMap={itemMap}
    />
  );
});
