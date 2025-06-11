import moment from "moment";
import { useMemo, useState } from "react";
import { FollowUpInterface } from "../../api/FollowUpStore";
import { useStore } from "../../api/Store";
import { MyForm } from "../../blueprints/MyForm";
import { Field } from "../../constants/interfaces";
import { toOptions } from "../../constants/helpers";

export const FollowUpForm = (props: {
  item?: FollowUpInterface;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { item, setVisible, fetchFcn } = props;
  const { jobStore, followUpStore } = useStore();
  const [details, setDetails] = useState<FollowUpInterface>({
    job: item?.job,
    date: moment(item?.date).format("MMM D, YYYY"),
    message: item?.message,
    status: item?.status,
    reply: item?.reply,
  });
  const [msg, setMsg] = useState<Object>();
  const [isLoading, setLoading] = useState(false);

  const rawFields = useMemo(
    () => [
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
    ],
    [jobStore.items.length]
  ) as Field[][];

  const onClickCreate = async () => {
    setLoading(true);
    const resp = await followUpStore.addItem({
      ...details,
      date: moment(details.date, "MMM D, YYYY").format("YYYY-MM-DD"),
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
    const resp = await followUpStore.updateItem(item.id, {
      ...details,
      date: moment(details.date, "MMM D, YYYY").format("YYYY-MM-DD"),
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
    const resp = await followUpStore.deleteItem(item.id);
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
        title={item?.id ? "Edit FollowUp" : "FollowUp Creation Form"}
        details={details}
        setDetails={setDetails}
        onClickSubmit={item?.id ? onClickEdit : onClickCreate}
        hasDelete={!!item}
        onDelete={onClickDelete}
        objectName="followUp"
        msg={msg}
        isLoading={isLoading}
      />
    </div>
  );
};
