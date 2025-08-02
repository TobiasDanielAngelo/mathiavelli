import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import {
  Job,
  JOB_TYPE_CHOICES,
  JobInterface,
  SOURCE_CHOICES,
  STATUS_CHOICES,
  WORK_SETUP_CHOICES,
} from "../../api/JobStore";
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
      store={jobStore}
      datetimeFields={jobStore.datetimeFields}
      dateFields={jobStore.dateFields}
      timeFields={jobStore.timeFields}
    />
  );
};

export const JobCard = observer((props: { item: Job }) => {
  const { item } = props;
  const { fetchFcn, shownFields, itemMap, related } = useJobView();
  const { jobStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id", "createdAt"]}
      important={["title"]}
      prices={jobStore.priceFields}
      FormComponent={JobForm}
      deleteItem={jobStore.deleteItem}
      fetchFcn={fetchFcn}
      itemMap={itemMap}
      related={related}
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
  const { jobStore } = useStore();
  return (
    <MyGenericFilter
      view={new Job({}).$view}
      title="Job Filters"
      dateFields={[...jobStore.dateFields, ...jobStore.datetimeFields]}
      relatedFields={jobStore.relatedFields}
      optionFields={jobStore.optionFields}
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
  const values = useJobView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={jobStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <JobRow item={item} />}
      priceFields={jobStore.priceFields}
      {...values}
    />
  );
});

export const JobView = observer(() => {
  const { jobStore, settingStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<JobInterface, Job>(
    settingStore,
    "Job",
    new Job({})
  );
  const { params, setPageDetails } = values;
  const fetchFcn = async () => {
    const resp = await jobStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(() => [] satisfies KV<any>[], []);

  const actionModalDefs = [] satisfies ActionModalDef[];

  return (
    <MyGenericView<JobInterface>
      title={title}
      Context={JobViewContext}
      CollectionComponent={JobCollection}
      FormComponent={JobForm}
      FilterComponent={JobFilter}
      actionModalDefs={actionModalDefs}
      TableComponent={JobTable}
      related={jobStore.related}
      fetchFcn={fetchFcn}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
