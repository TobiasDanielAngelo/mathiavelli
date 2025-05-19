import { useMemo, useState } from "react";
import { useStore } from "../api/Store";
import { TagInterface } from "../api/TagStore";
import { MyForm } from "../blueprints/MyForm";
import { Field } from "../constants/interfaces";

export const TagForm = (props: {
  item?: TagInterface;
  setVisible?: (t: boolean) => void;
}) => {
  const { item, setVisible } = props;
  const { tagStore } = useStore();
  const [details, setDetails] = useState({
    name: item?.name,
    color: item?.color ?? "#d0021b",
  });
  const [msg, setMsg] = useState<Object>();
  const [isLoading, setLoading] = useState(false);

  const rawFields = useMemo(
    () => [
      [
        {
          name: "name",
          label: "Tag Name",
          type: "text",
        },
      ],
      [
        {
          name: "color",
          label: "Color",
          type: "color",
        },
      ],
    ],
    []
  ) as Field[][];

  const onClickCreate = async () => {
    setLoading(true);
    const resp = await tagStore.addItem(details);
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
    const resp = await tagStore.updateItem(item.id, {
      ...details,
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
    const resp = await tagStore.deleteItem(item.id);
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
        title={item ? "Edit Tag" : "Tag Creation Form"}
        details={details}
        setDetails={setDetails}
        onClickSubmit={item ? onClickEdit : onClickCreate}
        hasDelete={!!item}
        onDelete={onClickDelete}
        objectName="tag"
        msg={msg}
        isLoading={isLoading}
      />
    </div>
  );
};
