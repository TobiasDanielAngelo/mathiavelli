import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import {
  Document,
  DOCUMENT_TYPE_CHOICES,
  DocumentFields,
  DocumentInterface,
} from "../../api/DocumentStore";
import { useStore } from "../../api/Store";
import { KV, ActionModalDef } from "../../constants/interfaces";
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
import { Field } from "../../constants/interfaces";

export const { Context: DocumentViewContext, useGenericView: useDocumentView } =
  createGenericViewContext<DocumentInterface>();

const title = "Documents";

export const DocumentIdMap = {} as const;

export const DocumentForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: Partial<Document>;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { documentStore } = useStore();

  const fields = useMemo(
    () =>
      [
        [{ name: "title", label: "Title", type: "text" }],
        [{ name: "description", label: "Description", type: "text" }],
        [
          {
            name: "documentType",
            label: "Document Type",
            type: "select",
            options: toOptions(DOCUMENT_TYPE_CHOICES),
          },
        ],
        [{ name: "file", label: "File", type: "file" }],
        [{ name: "issuedDate", label: "Issued Date", type: "date" }],
        [{ name: "expiryDate", label: "Expiry Date", type: "date" }],
        [{ name: "isActive", label: "Is Active", type: "check" }],
      ] satisfies Field[][],
    []
  );

  return (
    <MyGenericForm<DocumentInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="document"
      fields={fields}
      store={documentStore}
      datetimeFields={DocumentFields.datetimeFields}
      dateFields={DocumentFields.dateFields}
      timeFields={DocumentFields.timeFields}
    />
  );
};

export const DocumentCard = observer((props: { item: Document }) => {
  const { item } = props;
  const { fetchFcn, shownFields, itemMap } = useDocumentView();
  const { documentStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id"]}
      important={[]}
      prices={DocumentFields.pricesFields}
      FormComponent={DocumentForm}
      deleteItem={documentStore.deleteItem}
      fetchFcn={fetchFcn}
      itemMap={itemMap}
    />
  );
});

export const DocumentDashboard = observer(() => {
  return <></>;
});

export const DocumentCollection = observer(() => {
  const { documentStore } = useStore();
  const { pageDetails, PageBar } = useDocumentView();

  return (
    <SideBySideView
      SideA={
        <MyGenericCollection
          CardComponent={DocumentCard}
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={documentStore.items}
        />
      }
      SideB={<DocumentDashboard />}
      ratio={0.7}
    />
  );
});

export const DocumentFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new Document({}).$view}
      title="Document Filters"
      dateFields={[
        ...DocumentFields.datetimeFields,
        ...DocumentFields.dateFields,
      ]}
      excludeFields={["id"]}
      relatedFields={[]}
      optionFields={[]}
    />
  );
});

export const DocumentRow = observer((props: { item: Document }) => {
  const { item } = props;
  const { fetchFcn } = useDocumentView();
  const { documentStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={DocumentForm}
      deleteItem={documentStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const DocumentTable = observer(() => {
  const { documentStore } = useStore();
  const values = useDocumentView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={documentStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <DocumentRow item={item} />}
      priceFields={DocumentFields.pricesFields}
      {...values}
    />
  );
});

export const DocumentView = observer(() => {
  const { documentStore, settingStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<DocumentInterface, Document>(
    settingStore,
    "Document",
    new Document({})
  );
  const { params, setPageDetails } = values;
  const fetchFcn = async () => {
    const resp = await documentStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(
    () =>
      [
        { key: "documentType", values: DOCUMENT_TYPE_CHOICES, label: "" },
      ] satisfies KV<any>[],
    []
  );

  const actionModalDefs = [] satisfies ActionModalDef[];

  return (
    <MyGenericView<DocumentInterface>
      title={title}
      Context={DocumentViewContext}
      CollectionComponent={DocumentCollection}
      FormComponent={DocumentForm}
      FilterComponent={DocumentFilter}
      actionModalDefs={actionModalDefs}
      TableComponent={DocumentTable}
      fetchFcn={fetchFcn}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
