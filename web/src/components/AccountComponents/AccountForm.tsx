import moment from "moment";
import { useMemo, useState } from "react";
import { AccountInterface } from "../../api/AccountStore";
import { useStore } from "../../api/Store";
import { MyForm } from "../../blueprints/MyForm";
import { Field } from "../../constants/interfaces";

export const AccountForm = (props: {
  item?: AccountInterface;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { item, setVisible, fetchFcn } = props;
  const { accountStore } = useStore();
  const [details, setDetails] = useState<AccountInterface>({
    name: item?.name,
    datetimeAdded: moment(item?.datetimeAdded).format("MMM D YYYY h:mm A"),
  });
  const [msg, setMsg] = useState<Object>();
  const [isLoading, setLoading] = useState(false);

  const rawFields = useMemo(
    () =>
      [
        [
          {
            name: "name",
            label: "Account Name",
            type: "text",
          },
        ],
      ] satisfies Field[][],
    []
  );

  const onClickCreate = async () => {
    setLoading(true);
    const resp = await accountStore.addItem({
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
    fetchFcn && fetchFcn();
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
    fetchFcn && fetchFcn();

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
    fetchFcn && fetchFcn();

    setVisible && setVisible(false);
  };

  return (
    <div className="items-center">
      <MyForm
        fields={rawFields}
        title={item?.id ? "Edit Account" : "Account Creation Form"}
        details={details}
        setDetails={setDetails}
        onClickSubmit={item ? onClickEdit : onClickCreate}
        hasDelete={!!item}
        onDelete={onClickDelete}
        objectName="account"
        msg={msg}
        isLoading={isLoading}
      />
    </div>
  );
};
