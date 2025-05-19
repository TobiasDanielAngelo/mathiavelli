import moment from "moment";
import { useMemo, useState } from "react";
import { JournalInterface } from "../api/JournalStore";
import { useStore } from "../api/Store";
import { MyForm } from "../blueprints/MyForm";
import { Field } from "../constants/interfaces";

export const JournalForm = (props: {
  item?: JournalInterface;
  setVisible?: (t: boolean) => void;
}) => {
  const { item, setVisible } = props;
  const { journalStore } = useStore();
  const [details, setDetails] = useState({
    title: item?.title,
    description: item?.description,
    datetimeCreated: item?.datetimeCreated,
  });
  const [msg, setMsg] = useState<Object>();
  const [isLoading, setLoading] = useState(false);

  const rawFields = useMemo(
    () => [
      [
        {
          name: "title",
          label: "Title",
          type: "text",
        },
      ],
      [
        {
          name: "description",
          label: "Journal Entry",
          type: "textarea",
        },
      ],
    ],
    []
  ) as Field[][];

  const onClickCreate = async () => {
    setLoading(true);
    const resp = await journalStore.addItem(details);
    setLoading(false);

    if (!resp.ok) {
      setMsg(resp.details);
      return;
    }
    setVisible && setVisible(false);
  };

  const onClickEdit = async () => {
    if (!item?.id) return;
    setLoading(true);
    const resp = await journalStore.updateItem(item.id, {
      ...details,
      datetimeCreated: moment(
        details.datetimeCreated,
        "MMM D YYYY h:mm A"
      ).toISOString(),
    });
    setLoading(false);

    if (!resp.ok) {
      setMsg(resp.details);
      return;
    }
    setVisible && setVisible(false);
  };

  const onClickDelete = async () => {
    if (!item?.id) return;
    setLoading(true);
    const resp = await journalStore.deleteItem(item.id);
    setLoading(false);

    if (!resp.ok) {
      setMsg(resp.details);
      return;
    }
    setVisible && setVisible(false);
  };

  return (
    <div className="items-center">
      <MyForm
        fields={rawFields}
        title={item ? "Edit Journal" : "Journal Creation Form"}
        details={details}
        setDetails={setDetails}
        onClickSubmit={item ? onClickEdit : onClickCreate}
        hasDelete={!!item}
        onDelete={onClickDelete}
        objectName="entry"
        msg={msg}
        isLoading={isLoading}
      />
    </div>
  );
};
