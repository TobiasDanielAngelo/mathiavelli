import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import {
  FollowUp,
  FOLLOWUP_STATUS_CHOICES,
  FollowUpFields,
  FollowUpInterface,
} from "../../api/FollowUpStore";
import { useStore } from "../../api/Store";
import { MyGenericCard } from "../../blueprints/MyGenericComponents/MyGenericCard";
import { MyGenericFilter } from "../../blueprints/MyGenericComponents/MyGenericFilter";
import { MyGenericForm } from "../../blueprints/MyGenericComponents/MyGenericForm";
import { createGenericViewContext } from "../../blueprints/MyGenericComponents/MyGenericProps";
import { MyGenericRow } from "../../blueprints/MyGenericComponents/MyGenericRow";
import { MyGenericTable } from "../../blueprints/MyGenericComponents/MyGenericTable";
import { SideBySideView } from "../../blueprints/SideBySideView";
import {
  sortAndFilterByIds,
  toOptions,
  toTitleCase,
} from "../../constants/helpers";
import { Field, PaginatedDetails } from "../../constants/interfaces";
import { useLocalStorageState, useVisible } from "../../constants/hooks";
import { useSearchParams } from "react-router-dom";
import { KV } from "../../blueprints/ItemDetails";
import { MyMultiDropdownSelector } from "../../blueprints";
import {
  ActionModalDef,
  MyGenericView,
} from "../../blueprints/MyGenericComponents/MyGenericView";

export const { Context: FollowUpViewContext, useGenericView: useFollowUpView } =
  createGenericViewContext<FollowUpInterface>();

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
      storeFns={{
        add: followUpStore.addItem,
        update: followUpStore.updateItem,
        delete: followUpStore.deleteItem,
      }}
      datetimeFields={FollowUpFields.datetime}
      dateFields={FollowUpFields.date}
    />
  );
};

export const FollowUpCard = observer((props: { item: FollowUp }) => {
  const { item } = props;
  const { fetchFcn, shownFields } = useFollowUpView();
  const { followUpStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["date"]}
      important={["job"]}
      body={["status", "message", "reply"]}
      prices={FollowUpFields.prices}
      FormComponent={FollowUpForm}
      deleteItem={followUpStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const FollowUpCollection = observer(() => {
  const { followUpStore } = useStore();
  const { pageDetails, PageBar } = useFollowUpView();

  return (
    <SideBySideView
      SideA={
        <div className="flex flex-col min-h-[85vh]">
          <PageBar />
          <div className="flex-1">
            {sortAndFilterByIds(
              followUpStore.items,
              pageDetails?.ids ?? [],
              (s) => s.id
            ).map((s) => (
              <FollowUpCard item={s} key={s.id} />
            ))}
          </div>
          <PageBar />
        </div>
      }
      SideB=""
      ratio={0.7}
    />
  );
});

export const FollowUpFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new FollowUp({}).$view}
      title="FollowUp Filters"
      dateFields={[...FollowUpFields.date, ...FollowUpFields.datetime]}
      excludeFields={["id"]}
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
  const { shownFields, params, setParams, pageDetails, PageBar, itemMap } =
    useFollowUpView();

  return (
    <MyGenericTable
      items={followUpStore.items}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <FollowUpRow item={item} />}
      priceFields={FollowUpFields.prices}
      itemMap={itemMap}
    />
  );
});

export const FollowUpView = observer(() => {
  const { followUpStore, jobStore } = useStore();
  const { setVisible1, isVisible, setVisible } = useVisible();
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const [params, setParams] = useSearchParams();
  const objWithFields = new FollowUp({}).$;
  const [shownFields, setShownFields] = useLocalStorageState(
    Object.keys(objWithFields) as (keyof FollowUpInterface)[],
    "shownFieldsFollowUp"
  );
  const fetchFcn = async () => {
    const resp = await followUpStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(
    () =>
      [
        {
          key: "job",
          values: jobStore.items,
          label: "company",
        },
        {
          key: "status",
          values: FOLLOWUP_STATUS_CHOICES,
          label: "",
        },
      ] satisfies KV<any>[],
    [jobStore.items.length]
  );

  const actionModalDefs = [
    {
      icon: "NoteAdd",
      label: "NEW",
      name: "Add a FollowUp",
      modal: <FollowUpForm fetchFcn={fetchFcn} setVisible={setVisible1} />,
    },
    {
      icon: "ViewList",
      label: "FIELDS",
      name: "Show Fields",
      modal: (
        <MyMultiDropdownSelector
          label="Fields"
          value={shownFields}
          onChangeValue={(t) =>
            setShownFields(t as (keyof FollowUpInterface)[])
          }
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
      modal: <FollowUpFilter />,
    },
  ] satisfies ActionModalDef[];

  return (
    <MyGenericView<FollowUpInterface>
      fetchFcn={fetchFcn}
      actionModalDefs={actionModalDefs}
      isVisible={isVisible}
      setVisible={setVisible}
      Context={FollowUpViewContext}
      CollectionComponent={FollowUpCollection}
      TableComponent={FollowUpTable}
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
