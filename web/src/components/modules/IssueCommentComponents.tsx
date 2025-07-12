import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import {
  IssueComment,
  IssueCommentFields,
  IssueCommentInterface,
} from "../../api/IssueCommentStore";
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
import { toOptions } from "../../constants/helpers";
import { useVisible } from "../../constants/hooks";
import { Field } from "../../constants/interfaces";

export const {
  Context: IssueCommentViewContext,
  useGenericView: useIssueCommentView,
} = createGenericViewContext<IssueCommentInterface>();

export const IssueCommentIdMap = {} as const;

const title = "Issue Comments";

export const IssueCommentForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: IssueComment;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { issueCommentStore, ticketStore, userStore } = useStore();

  const fields = useMemo(
    () =>
      [
        [
          {
            name: "ticket",
            label: "Ticket",
            type: "select",
            options: toOptions(ticketStore.items, "title"),
          },
        ],
        [
          {
            name: "user",
            label: "User",
            type: "select",
            options: toOptions(userStore.items, "firstName"),
          },
        ],
        [{ name: "content", label: "Content", type: "textarea" }],
        [{ name: "createdAt", label: "Created At", type: "datetime" }],
      ] satisfies Field[][],
    [ticketStore.items.length, userStore.items.length]
  );

  return (
    <MyGenericForm<IssueCommentInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="issueComment"
      fields={fields}
      store={issueCommentStore}
      datetimeFields={IssueCommentFields.datetimeFields}
      dateFields={IssueCommentFields.dateFields}
      timeFields={IssueCommentFields.timeFields}
    />
  );
};

export const IssueCommentCard = observer((props: { item: IssueComment }) => {
  const { item } = props;
  const { fetchFcn, shownFields, itemMap } = useIssueCommentView();
  const { issueCommentStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id"]}
      prices={IssueCommentFields.pricesFields}
      FormComponent={IssueCommentForm}
      deleteItem={issueCommentStore.deleteItem}
      fetchFcn={fetchFcn}
      itemMap={itemMap}
    />
  );
});

export const IssueCommentDashboard = observer(() => {
  return <></>;
});

export const IssueCommentCollection = observer(() => {
  const { issueCommentStore } = useStore();
  const { pageDetails, PageBar } = useIssueCommentView();

  return (
    <SideBySideView
      SideA={
        <MyGenericCollection
          title={title}
          CardComponent={IssueCommentCard}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={issueCommentStore.items}
        />
      }
      SideB={<IssueCommentDashboard />}
      ratio={0.7}
    />
  );
});

export const IssueCommentFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new IssueComment({}).$view}
      title="IssueComment Filters"
      dateFields={IssueCommentFields.datetimeFields}
      excludeFields={["id"]}
    />
  );
});

export const IssueCommentRow = observer((props: { item: IssueComment }) => {
  const { item } = props;
  const { fetchFcn } = useIssueCommentView();
  const { issueCommentStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={IssueCommentForm}
      deleteItem={issueCommentStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const IssueCommentTable = observer(() => {
  const { issueCommentStore } = useStore();
  const values = useIssueCommentView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={issueCommentStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <IssueCommentRow item={item} />}
      priceFields={IssueCommentFields.pricesFields}
      {...values}
    />
  );
});

export const IssueCommentView = observer(() => {
  const { issueCommentStore, settingStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<IssueCommentInterface, IssueComment>(
    settingStore,
    "Category",
    new IssueComment({})
  );
  const { params, setPageDetails } = values;
  const fetchFcn = async () => {
    const resp = await issueCommentStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(() => [] satisfies KV<any>[], []);

  const actionModalDefs = [] satisfies ActionModalDef[];

  return (
    <MyGenericView<IssueCommentInterface>
      title={title}
      Context={IssueCommentViewContext}
      CollectionComponent={IssueCommentCollection}
      FormComponent={IssueCommentForm}
      FilterComponent={IssueCommentFilter}
      actionModalDefs={actionModalDefs}
      TableComponent={IssueCommentTable}
      fetchFcn={fetchFcn}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
