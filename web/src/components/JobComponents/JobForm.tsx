import moment from "moment";
import { useMemo, useState } from "react";
import { JobInterface } from "../../api/JobStore";
import { useStore } from "../../api/Store";
import { MyForm } from "../../blueprints/MyForm";
import { Field } from "../../constants/interfaces";
import { toOptions } from "../../constants/helpers";
import {
  jobSources,
  jobStatuses,
  jobTypes,
  workSetups,
} from "../../constants/constants";

export const JobForm = (props: {
  item?: JobInterface;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { item, setVisible, fetchFcn } = props;
  const { jobStore } = useStore();
  const [details, setDetails] = useState<JobInterface>({
    title: item?.title,
    company: item?.company,
    location: item?.location,
    link: item?.link,
    source: item?.source,
    salary: item?.salary,
    deadline: moment(item?.deadline).format("MMM D, YYYY"),
    status: item?.status,
    appliedDate: moment(item?.appliedDate).format("MMM D, YYYY"),
    notes: item?.notes,
    createdAt: moment(item?.createdAt).format("MMM D, YYYY h:mm A"),
    updatedAt: moment(item?.updatedAt).format("MMM D, YYYY h:mm A"),
    workSetup: item?.workSetup,
    jobType: item?.jobType,
  });
  const [msg, setMsg] = useState<Object>();
  const [isLoading, setLoading] = useState(false);

  const rawFields = useMemo(
    () => [
      [{ name: "title", label: "Title", type: "text" }],
      [{ name: "company", label: "Company", type: "text" }],
      [{ name: "location", label: "Location", type: "text" }],
      [{ name: "link", label: "Link", type: "text" }],
      [
        {
          name: "source",
          label: "Source",
          type: "select",
          options: toOptions(jobSources),
        },
      ],
      [{ name: "salary", label: "Salary + Package", type: "text" }],
      [{ name: "deadline", label: "Deadline", type: "date" }],
      [
        {
          name: "status",
          label: "Status",
          type: "select",
          options: toOptions(jobStatuses),
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
          options: toOptions(workSetups),
        },
      ],
      [
        {
          name: "jobType",
          label: "Job Type",
          type: "select",
          options: toOptions(jobTypes),
        },
      ],
    ],
    []
  ) as Field[][];

  const onClickCreate = async () => {
    setLoading(true);
    const resp = await jobStore.addItem({
      ...details,
      deadline: moment(details.deadline, "MMM D, YYYY").format("YYYY-MM-DD"),
      appliedDate: moment(details.appliedDate, "MMM D, YYYY").format(
        "YYYY-MM-DD"
      ),
      createdAt: moment(details.createdAt, "MMM D YYYY h:mm A").toISOString(),
      updatedAt: moment(details.updatedAt, "MMM D YYYY h:mm A").toISOString(),
    });
    setLoading(false);

    if (!resp.ok) {
      setMsg(resp.details);
      return;
    }
    fetchFcn && fetchFcn();
    setVisible && setVisible(false);
  };

  const onClickEdit = async () => {
    if (!item?.id) return;
    setLoading(true);
    const resp = await jobStore.updateItem(item.id, {
      ...details,
      deadline: moment(details.deadline, "MMM D, YYYY").format("YYYY-MM-DD"),
      appliedDate: moment(details.appliedDate, "MMM D, YYYY").format(
        "YYYY-MM-DD"
      ),
      createdAt: moment(details.createdAt, "MMM D YYYY h:mm A").toISOString(),
      updatedAt: moment(details.updatedAt, "MMM D YYYY h:mm A").toISOString(),
    });
    setLoading(false);

    if (!resp.ok) {
      setMsg(resp.details);
      return;
    }
    fetchFcn && fetchFcn();
    setVisible && setVisible(false);
  };

  const onClickDelete = async () => {
    if (!item?.id) return;
    setLoading(true);
    const resp = await jobStore.deleteItem(item.id);
    setLoading(false);

    if (!resp.ok) {
      setMsg(resp.details);
      return;
    }
    fetchFcn && fetchFcn();
    setVisible && setVisible(false);
  };

  return (
    <div className="items-center">
      <MyForm
        fields={rawFields}
        title={item?.id ? "Edit Job" : "Job Creation Form"}
        details={details}
        setDetails={setDetails}
        onClickSubmit={item?.id ? onClickEdit : onClickCreate}
        hasDelete={!!item}
        onDelete={onClickDelete}
        objectName="job"
        msg={msg}
        isLoading={isLoading}
      />
    </div>
  );
};
