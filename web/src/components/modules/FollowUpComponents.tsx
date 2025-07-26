import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { FollowUp, FollowUpInterface } from "../../api/FollowUpStore";
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
import { toOptions } from "../../constants/helpers";
import { useVisible } from "../../constants/hooks";
import { ActionModalDef, Field, KV } from "../../constants/interfaces";

export const { Context: FollowUpViewContext, useGenericView: useFollowUpView } =
  createGenericViewContext<FollowUpInterface>();

const title = "Follow Ups";

export const FollowUpIdMap = {} as const;

export const FollowUpForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: FollowUp;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { followUpStore, jobStore } = useStore();

  const fields = useMemo(
    () =>
      [
        [
          {
            name: "job",
            label: "Job",
            type: "select",
            options: toOptions(jobStore.items, "company"),
          },
        ],
        [{ name: "date", label: "Date", type: "date" }],
        [{ name: "message", label: "Message", type: "textarea" }],
        [{ name: "status", label: "Status", type: "number" }],
        [{ name: "reply", label: "Reply", type: "textarea" }],
      ] satisfies Field[][],
    [jobStore.items.length]
  );
  return (
    <MyGenericForm<FollowUpInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="follow-up"
      fields={fields}
      store={followUpStore}
      datetimeFields={followUpStore.datetimeFields}
      dateFields={followUpStore.dateFields}
      timeFields={followUpStore.timeFields}
    />
  );
};

export const FollowUpCard = observer((props: { item: FollowUp }) => {
  const { item } = props;
  const { fetchFcn, shownFields, itemMap, related } = useFollowUpView();
  const { followUpStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id", "date"]}
      important={["job"]}
      prices={followUpStore.priceFields}
      FormComponent={FollowUpForm}
      deleteItem={followUpStore.deleteItem}
      fetchFcn={fetchFcn}
      itemMap={itemMap}
      related={related}
    />
  );
});

export const FollowUpCollection = observer(() => {
  const { followUpStore } = useStore();
  const { pageDetails, PageBar } = useFollowUpView();

  return (
    <SideBySideView
      SideA={
        <MyGenericCollection
          CardComponent={FollowUpCard}
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={followUpStore.items}
        />
      }
      SideB=""
      ratio={0.7}
    />
  );
});

export const FollowUpFilter = observer(() => {
  const { followUpStore } = useStore();
  return (
    <MyGenericFilter
      view={new FollowUp({}).$view}
      title="FollowUp Filters"
      dateFields={[
        ...followUpStore.dateFields,
        ...followUpStore.datetimeFields,
      ]}
      relatedFields={followUpStore.relatedFields}
      optionFields={followUpStore.optionFields}
    />
  );
});

export const FollowUpRow = observer((props: { item: FollowUp }) => {
  const { item } = props;
  const { fetchFcn } = useFollowUpView();
  const { followUpStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={FollowUpForm}
      deleteItem={followUpStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const FollowUpTable = observer(() => {
  const { followUpStore } = useStore();
  const values = useFollowUpView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={followUpStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <FollowUpRow item={item} />}
      priceFields={followUpStore.priceFields}
      {...values}
    />
  );
});

export const FollowUpView = observer(() => {
  const { followUpStore, settingStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<FollowUpInterface, FollowUp>(
    settingStore,
    "FollowUp",
    new FollowUp({})
  );
  const { params, setPageDetails } = values;
  const fetchFcn = async () => {
    const resp = await followUpStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(() => [] satisfies KV<any>[], []);

  const actionModalDefs = [] satisfies ActionModalDef[];

  return (
    <MyGenericView<FollowUpInterface>
      title={title}
      Context={FollowUpViewContext}
      CollectionComponent={FollowUpCollection}
      FormComponent={FollowUpForm}
      FilterComponent={FollowUpFilter}
      actionModalDefs={actionModalDefs}
      TableComponent={FollowUpTable}
      related={followUpStore.related}
      fetchFcn={fetchFcn}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
