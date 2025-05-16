import moment from "moment";
import { useMemo, useState } from "react";
import { AccountInterface } from "../api/AccountStore";
import { useStore } from "../api/Store";
import { MyForm } from "../blueprints/MyForm";
import { Field } from "../constants/interfaces";

export const AccountForm = (props: {
  item?: AccountInterface;
  setVisible?: (t: boolean) => void;
}) => {
  const { item, setVisible } = props;
  const { accountStore } = useStore();
  const [details, setDetails] = useState({
    name: item?.name,
    datetimeAdded: item?.datetimeAdded,
  });
  const [msg, setMsg] = useState<Object>();
  const [isLoading, setLoading] = useState(false);

  const rawFields = useMemo(
    () => [
      [
        {
          name: "name",
          label: "Account Name",
          type: "text",
        },
      ],
    ],
    []
  ) as Field[][];

  const onClickCreate = async () => {
    setLoading(true);
    const resp = await accountStore.addItem(details);
    setLoading(false);

    if (!resp.ok) {
      setMsg(resp.details);
      return;
    }
    accountStore.fetchAll();
    setVisible && setVisible(false);
  };

  const onClickEdit = async () => {
    if (!item?.id) return;
    setLoading(true);
    const resp = await accountStore.updateItem(item.id, {
      ...details,
      datetimeAdded: moment(
        details.datetimeAdded,
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
    const resp = await accountStore.deleteItem(item.id);
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
        title={item ? "Edit Account" : "Account Creation Form"}
        details={details}
        setDetails={setDetails}
        onClickSubmit={item ? onClickEdit : onClickCreate}
        hasDelete={!!item}
        onDelete={onClickDelete}
        objectName="log"
        msg={msg}
        isLoading={isLoading}
      />
    </div>
  );
};
