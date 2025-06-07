import { useMemo, useState } from "react";
import { useStore } from "../../api/Store";
import { CategoryInterface } from "../../api/CategoryStore";
import { MyForm } from "../../blueprints/MyForm";
import { Field } from "../../constants/interfaces";

export const CategoryForm = (props: {
  item?: CategoryInterface;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { item, setVisible, fetchFcn } = props;
  const { categoryStore } = useStore();
  const [details, setDetails] = useState({
    title: item?.title,
    logo: item?.logo,
  });
  const [msg, setMsg] = useState<Object>();
  const [isLoading, setLoading] = useState(false);

  const rawFields = useMemo(
    () =>
      [
        [
          {
            name: "title",
            label: "Title",
            type: "text",
          },
        ],
        [
          {
            name: "logo",
            label: "Logo",
            type: "text",
          },
        ],
      ] satisfies Field[][],
    []
  );

  const onClickCreate = async () => {
    setLoading(true);
    const resp = await categoryStore.addItem(details);
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
    const resp = await categoryStore.updateItem(item.id, {
      ...details,
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
    const resp = await categoryStore.deleteItem(item.id);
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
        title={item?.id ? "Edit Category" : "Category Creation Form"}
        details={details}
        setDetails={setDetails}
        onClickSubmit={item ? onClickEdit : onClickCreate}
        hasDelete={!!item}
        onDelete={onClickDelete}
        objectName="category"
        msg={msg}
        isLoading={isLoading}
      />
    </div>
  );
};
