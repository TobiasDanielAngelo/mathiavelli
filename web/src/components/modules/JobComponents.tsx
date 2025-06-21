import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Job,
  JOB_TYPE_CHOICES,
  JobFields,
  JobInterface,
  SOURCE_CHOICES,
  STATUS_CHOICES,
  WORK_SETUP_CHOICES,
} from "../../api/JobStore";
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
  GraphType,
  MyGenericView,
} from "../../blueprints/MyGenericComponents/MyGenericView";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { toOptions, toTitleCase } from "../../constants/helpers";
import { useLocalStorageState, useVisible } from "../../constants/hooks";
import { Field, PaginatedDetails } from "../../constants/interfaces";

export const { Context: JobViewContext, useGenericView: useJobView } =
  createGenericViewContext<JobInterface>();

const title = "Jobs";

export const JobIdMap = {} as const;

export const JobForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: Job;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { jobStore } = useStore();

  const fields = useMemo(
    () =>
      [
        [{ name: "title", label: "Title", type: "text" }],
        [{ name: "company", label: "Company", type: "text" }],
        [{ name: "location", label: "Location", type: "text" }],
        [{ name: "link", label: "Link", type: "text" }],
        [
          {
            name: "source",
            label: "Source",
            type: "select",
            options: toOptions(SOURCE_CHOICES),
          },
        ],
        [{ name: "salary", label: "Salary + Package", type: "text" }],
        [{ name: "deadline", label: "Deadline", type: "date" }],
        [
          {
            name: "status",
            label: "Status",
            type: "select",
            options: toOptions(STATUS_CHOICES),
          },
        ],
        [{ name: "appliedDate", label: "Applied Date", type: "date" }],
        [{ name: "notes", label: "Notes", type: "textarea" }],
        [{ name: "createdAt", label: "Created At", type: "datetime" }],
        [{ name: "updatedAt", label: "Updated At", type: "datetime" }],
        [
          {
            name: "workSetup",
            label: "Work Setup",
            type: "select",
            options: toOptions(WORK_SETUP_CHOICES),
          },
        ],
        [
          {
            name: "jobType",
            label: "Job Type",
            type: "select",
            options: toOptions(JOB_TYPE_CHOICES),
          },
        ],
      ] satisfies Field[][],
    []
  );

  return (
    <MyGenericForm<JobInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="job"
      fields={fields}
      storeFns={{
        add: jobStore.addItem,
        update: jobStore.updateItem,
        delete: jobStore.deleteItem,
      }}
      datetimeFields={JobFields.datetime}
      dateFields={JobFields.date}
    />
  );
};

export const JobCard = observer((props: { item: Job }) => {
  const { item } = props;
  const { fetchFcn, shownFields } = useJobView();
  const { jobStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["createdAt"]}
      important={["title"]}
      body={[
        "company",
        "salary",
        "workSetupName",
        "jobTypeName",
        "link",
        "location",
        "notes",
        "sourceName",
        "statusName",
        "appliedDate",
        "deadline",
        "updatedAt",
      ]}
      prices={JobFields.prices}
      FormComponent={JobForm}
      deleteItem={jobStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const JobDashboard = observer(() => {
  return <></>;
});

export const JobCollection = observer(() => {
  const { jobStore } = useStore();
  const { pageDetails, PageBar } = useJobView();

  return (
    <SideBySideView
      SideA={
        <MyGenericCollection
          CardComponent={JobCard}
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={jobStore.items}
        />
      }
      SideB={<JobDashboard />}
      ratio={0.7}
    />
  );
});

export const JobFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new Job({}).$view}
      title="Job Filters"
      dateFields={[...JobFields.date, ...JobFields.datetime]}
      excludeFields={["id"]}
    />
  );
});

export const JobRow = observer((props: { item: Job }) => {
  const { item } = props;
  const { fetchFcn } = useJobView();
  const { jobStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={JobForm}
      deleteItem={jobStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const JobTable = observer(() => {
  const { jobStore } = useStore();
  const {
    shownFields,
    params,
    setParams,
    pageDetails,
    PageBar,
    itemMap,
    sortFields,
    setSortFields,
  } = useJobView();

  return (
    <MyGenericTable
      items={jobStore.items}
      shownFields={shownFields}
      sortFields={sortFields}
      setSortFields={setSortFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <JobRow item={item} />}
      priceFields={JobFields.prices}
      itemMap={itemMap}
    />
  );
});

export const JobView = observer(() => {
  const { jobStore } = useStore();
  const { setVisible1, isVisible, setVisible } = useVisible();
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const [params, setParams] = useSearchParams();
  const objWithFields = new Job({}).$view;
  const [graph, setGraph] = useState<GraphType>("pie");
  const [shownFields, setShownFields] = useLocalStorageState(
    Object.keys(objWithFields) as (keyof JobInterface)[],
    "shownFieldsJob"
  );
  const [sortFields, setSortFields] = useLocalStorageState(
    [] as string[],
    "sortFieldsJob"
  );
  const fetchFcn = async () => {
    const resp = await jobStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(
    () =>
      [
        {
          key: "status",
          values: STATUS_CHOICES,
          label: "",
        },
        {
          key: "source",
          values: SOURCE_CHOICES,
          label: "",
        },
        {
          key: "workSetup",
          values: WORK_SETUP_CHOICES,
          label: "",
        },
        {
          key: "jobType",
          values: JOB_TYPE_CHOICES,
          label: "",
        },
      ] satisfies KV<any>[],
    []
  );

  const actionModalDefs = [
    {
      icon: "NoteAdd",
      label: "NEW",
      name: "Add a Job",
      modal: <JobForm fetchFcn={fetchFcn} setVisible={setVisible1} />,
    },
    {
      icon: "ViewList",
      label: "FIELDS",
      name: "Show Fields",
      modal: (
        <MyMultiDropdownSelector
          label="Fields"
          value={shownFields}
          onChangeValue={(t) => setShownFields(t as (keyof JobInterface)[])}
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
      modal: <JobFilter />,
    },
  ] satisfies ActionModalDef[];

  return (
    <MyGenericView<JobInterface>
      title={title}
      fetchFcn={fetchFcn}
      actionModalDefs={actionModalDefs}
      isVisible={isVisible}
      setVisible={setVisible}
      Context={JobViewContext}
      CollectionComponent={JobCollection}
      TableComponent={JobTable}
      shownFields={shownFields}
      setShownFields={setShownFields}
      sortFields={sortFields}
      setSortFields={setSortFields}
      availableGraphs={["pie", "line"]}
      pageDetails={pageDetails}
      params={params}
      setParams={setParams}
      itemMap={itemMap}
      graph={graph}
      setGraph={setGraph}
    />
  );
});
