import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { Note, NoteInterface } from "../../api/NoteStore";
import { useStore } from "../../api/Store";
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
import { useVisible } from "../../constants/hooks";
import { ActionModalDef, Field, KV } from "../../constants/interfaces";

export const { Context: NoteViewContext, useGenericView: useNoteView } =
  createGenericViewContext<NoteInterface>();

const title = "Notes";

export const NoteIdMap = {} as const;

export const NoteForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: Note;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { noteStore } = useStore();

  const fields = useMemo(
    () =>
      [
        [{ name: "title", label: "Title", type: "text" }],
        [{ name: "body", label: "Body", type: "textarea" }],
        [{ name: "file", label: "File Attachment", type: "file" }],
      ] satisfies Field[][],
    []
  );

  return (
    <MyGenericForm<NoteInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="note"
      fields={fields}
      store={noteStore}
      datetimeFields={noteStore.datetimeFields}
      dateFields={noteStore.dateFields}
      timeFields={noteStore.timeFields}
    />
  );
};

export const NoteCard = observer((props: { item: Note }) => {
  const { item } = props;
  const { fetchFcn, shownFields, itemMap, related } = useNoteView();
  const { noteStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id"]}
      important={["title"]}
      prices={noteStore.priceFields}
      FormComponent={NoteForm}
      deleteItem={noteStore.deleteItem}
      fetchFcn={fetchFcn}
      itemMap={itemMap}
      related={related}
    />
  );
});

export const NoteDashboard = observer(() => {
  return <></>;
});

export const NoteCollection = observer(() => {
  const { noteStore } = useStore();
  const { pageDetails, PageBar } = useNoteView();

  return (
    <SideBySideView
      SideA={
        <MyGenericCollection
          CardComponent={NoteCard}
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={noteStore.items}
        />
      }
      SideB={<NoteDashboard />}
      ratio={0.7}
    />
  );
});

export const NoteFilter = observer(() => {
  const { noteStore } = useStore();
  return (
    <MyGenericFilter
      view={new Note({}).$view}
      title="Note Filters"
      dateFields={[...noteStore.dateFields, ...noteStore.datetimeFields]}
      relatedFields={noteStore.relatedFields}
      optionFields={noteStore.optionFields}
    />
  );
});

export const NoteRow = observer((props: { item: Note }) => {
  const { item } = props;
  const { fetchFcn } = useNoteView();
  const { noteStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={NoteForm}
      deleteItem={noteStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const NoteTable = observer(() => {
  const { noteStore } = useStore();
  const values = useNoteView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={noteStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <NoteRow item={item} />}
      priceFields={noteStore.priceFields}
      {...values}
    />
  );
});

export const NoteView = observer(() => {
  const { noteStore, settingStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<NoteInterface, Note>(
    settingStore,
    "Note",
    new Note({})
  );
  const { params, setPageDetails } = values;
  const fetchFcn = async () => {
    const resp = await noteStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(() => [] as KV<any>[], []);

  const actionModalDefs = [] satisfies ActionModalDef[];

  return (
    <MyGenericView<NoteInterface>
      title={title}
      Context={NoteViewContext}
      CollectionComponent={NoteCollection}
      FormComponent={NoteForm}
      FilterComponent={NoteFilter}
      actionModalDefs={actionModalDefs}
      TableComponent={NoteTable}
      related={noteStore.related}
      fetchFcn={fetchFcn}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
