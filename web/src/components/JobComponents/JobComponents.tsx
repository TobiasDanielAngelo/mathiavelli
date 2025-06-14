import { observer } from "mobx-react-lite";
import { useMemo } from "react";
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
import { MyGenericCard } from "../../blueprints/MyGenericComponents/MyGenericCard";
import { MyGenericFilter } from "../../blueprints/MyGenericComponents/MyGenericFilter";
import { MyGenericForm } from "../../blueprints/MyGenericComponents/MyGenericForm";
import { createGenericViewContext } from "../../blueprints/MyGenericComponents/MyGenericProps";
import { MyGenericRow } from "../../blueprints/MyGenericComponents/MyGenericRow";
import { MyGenericTable } from "../../blueprints/MyGenericComponents/MyGenericTable";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { sortAndFilterByIds, toOptions } from "../../constants/helpers";
import { Field } from "../../constants/interfaces";

export const { Context: JobViewContext, useGenericView: useJobView } =
  createGenericViewContext<JobInterface>();

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
        <div className="flex flex-col min-h-[85vh]">
          <PageBar />
          <div className="flex-1">
            {sortAndFilterByIds(
              jobStore.items,
              pageDetails?.ids ?? [],
              (s) => s.id
            ).map((s) => (
              <JobCard item={s} key={s.id} />
            ))}
          </div>
          <PageBar />
        </div>
      }
      SideB={<JobDashboard />}
      ratio={0.7}
    />
  );
});

export const JobFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new Job({}).$}
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
  const { shownFields, params, setParams, pageDetails, PageBar } = useJobView();

  return (
    <MyGenericTable
      items={jobStore.items}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <JobRow item={item} />}
    />
  );
});
