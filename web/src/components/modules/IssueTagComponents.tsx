import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import {
  IssueTag,
  IssueTagFields,
  IssueTagInterface,
} from "../../api/IssueTagStore";
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

export const { Context: IssueTagViewContext, useGenericView: useIssueTagView } =
  createGenericViewContext<IssueTagInterface>();

const title = "Issue Tags";

export const IssueTagIdMap = {} as const;

export const IssueTagForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: Partial<IssueTag>;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { issueTagStore } = useStore();

  const fields = useMemo(
    () =>
      [[{ name: "name", label: "Name", type: "textarea" }]] satisfies Field[][],
    []
  );

  return (
    <MyGenericForm<IssueTagInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="issueTag"
      fields={fields}
      store={issueTagStore}
      datetimeFields={IssueTagFields.datetimeFields}
      dateFields={IssueTagFields.dateFields}
      timeFields={IssueTagFields.timeFields}
    />
  );
};

export const IssueTagCard = observer((props: { item: IssueTag }) => {
  const { item } = props;
  const { fetchFcn, shownFields } = useIssueTagView();
  const { issueTagStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id"]}
      important={[]}
      prices={IssueTagFields.pricesFields}
      FormComponent={IssueTagForm}
      deleteItem={issueTagStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const IssueTagDashboard = observer(() => {
  return <></>;
});

export const IssueTagCollection = observer(() => {
  const { issueTagStore } = useStore();
  const { pageDetails, PageBar } = useIssueTagView();

  return (
    <SideBySideView
      SideA={
        <MyGenericCollection
          CardComponent={IssueTagCard}
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={issueTagStore.items}
        />
      }
      SideB={<IssueTagDashboard />}
      ratio={0.7}
    />
  );
});

export const IssueTagFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new IssueTag({}).$view}
      title="IssueTag Filters"
      dateFields={[
        ...IssueTagFields.datetimeFields,
        ...IssueTagFields.dateFields,
      ]}
      excludeFields={["id"]}
      relatedFields={[]}
      optionFields={[]}
    />
  );
});

export const IssueTagRow = observer((props: { item: IssueTag }) => {
  const { item } = props;
  const { fetchFcn } = useIssueTagView();
  const { issueTagStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={IssueTagForm}
      deleteItem={issueTagStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const IssueTagTable = observer(() => {
  const { issueTagStore } = useStore();
  const values = useIssueTagView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={issueTagStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <IssueTagRow item={item} />}
      priceFields={IssueTagFields.pricesFields}
      {...values}
    />
  );
});

export const IssueTagView = observer(() => {
  const { issueTagStore, settingStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<IssueTagInterface, IssueTag>(
    settingStore,
    "IssueTag",
    new IssueTag({})
  );
  const { params, setPageDetails } = values;
  const fetchFcn = async () => {
    const resp = await issueTagStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(() => [] satisfies KV<any>[], []);

  const actionModalDefs = [] satisfies ActionModalDef[];

  return (
    <MyGenericView<IssueTagInterface>
      title={title}
      Context={IssueTagViewContext}
      CollectionComponent={IssueTagCollection}
      FormComponent={IssueTagForm}
      FilterComponent={IssueTagFilter}
      actionModalDefs={actionModalDefs}
      TableComponent={IssueTagTable}
      fetchFcn={fetchFcn}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
