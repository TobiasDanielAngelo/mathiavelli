import { useMemo, useState } from "react";
import { PlatformInterface } from "../../api/PlatformStore";
import { useStore } from "../../api/Store";
import { MyForm } from "../../blueprints/MyForm";
import { Field } from "../../constants/interfaces";

export const PlatformForm = (props: {
  item?: PlatformInterface;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { item, setVisible, fetchFcn } = props;
  const { platformStore } = useStore();
  const [details, setDetails] = useState<PlatformInterface>({
    name: item?.name,
  });
  const [msg, setMsg] = useState<Object>();
  const [isLoading, setLoading] = useState(false);

  const rawFields = useMemo(
    () => [[{ name: "name", label: "Name", type: "text" }]] satisfies Field[][],
    []
  );

  const onClickCreate = async () => {
    setLoading(true);
    const resp = await platformStore.addItem({
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

  const onClickEdit = async () => {
    if (!item?.id) return;
    setLoading(true);
    const resp = await platformStore.updateItem(item.id, {
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
    const resp = await platformStore.deleteItem(item.id);
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
        title={item?.id ? "Edit Platform" : "Platform Creation Form"}
        details={details}
        setDetails={setDetails}
        onClickSubmit={item?.id ? onClickEdit : onClickCreate}
        hasDelete={!!item}
        onDelete={onClickDelete}
        objectName="platform"
        msg={msg}
        isLoading={isLoading}
      />
    </div>
  );
};
