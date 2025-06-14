import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import {
  Journal,
  JournalFields,
  JournalInterface,
} from "../../api/JournalStore";
import { useStore } from "../../api/Store";
import { MyGenericCard } from "../../blueprints/MyGenericComponents/MyGenericCard";
import { MyGenericFilter } from "../../blueprints/MyGenericComponents/MyGenericFilter";
import { MyGenericForm } from "../../blueprints/MyGenericComponents/MyGenericForm";
import { createGenericViewContext } from "../../blueprints/MyGenericComponents/MyGenericProps";
import { MyGenericRow } from "../../blueprints/MyGenericComponents/MyGenericRow";
import { MyGenericTable } from "../../blueprints/MyGenericComponents/MyGenericTable";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { sortAndFilterByIds } from "../../constants/helpers";
import { Field } from "../../constants/interfaces";

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
        <div className="flex flex-col min-h-[85vh]">
          <PageBar />
          <div className="flex-1">
            {sortAndFilterByIds(
              journalStore.items,
              pageDetails?.ids ?? [],
              (s) => s.id
            ).map((s) => (
              <JournalCard item={s} key={s.id} />
            ))}
          </div>
          <PageBar />
        </div>
      }
      SideB={<JournalDashboard />}
      ratio={0.7}
    />
  );
});

export const JournalFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new Journal({}).$}
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
  const { shownFields, params, setParams, pageDetails, PageBar } =
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
    />
  );
});
