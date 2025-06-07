import moment from "moment";
import { useMemo, useState } from "react";
import { BuyListItemInterface } from "../../api/BuyListItemStore";
import { useStore } from "../../api/Store";
import { MyForm } from "../../blueprints/MyForm";
import { Field } from "../../constants/interfaces";
import { toOptions } from "../../constants/helpers";
import { priority, status } from "../../constants/constants";

export const BuyListItemForm = (props: {
  item?: BuyListItemInterface;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { item, setVisible, fetchFcn } = props;
  const { buyListItemStore } = useStore();
  const [details, setDetails] = useState<BuyListItemInterface>({
    name: item?.name,
    estimatedPrice: item?.estimatedPrice,
    addedAt: moment(item?.addedAt).format("MMM D, YYYY h:mm A"),
    plannedDate: moment(item?.plannedDate).format("MMM D, YYYY"),
    priority: item?.priority,
    status: item?.status,
  });
  const [msg, setMsg] = useState<Object>();
  const [isLoading, setLoading] = useState(false);

  const rawFields = useMemo(
    () => [
      [{ name: "name", label: "Name", type: "text" }],
      [{ name: "estimatedPrice", label: "Estimated Price", type: "number" }],
      [{ name: "addedAt", label: "Added At", type: "datetime" }],
      [{ name: "plannedDate", label: "Planned Date", type: "date" }],
      [
        {
          name: "priority",
          label: "Priority",
          type: "select",
          options: toOptions(priority),
        },
      ],
      [
        {
          name: "status",
          label: "Status",
          type: "select",
          options: toOptions(status),
        },
      ],
    ],
    []
  ) as Field[][];

  const onClickCreate = async () => {
    setLoading(true);
    const resp = await buyListItemStore.addItem({
      ...details,
      addedAt: moment(details.addedAt, "MMM D YYYY h:mm A").toISOString(),
      plannedDate: moment(details.plannedDate, "MMM D, YYYY").format(
        "YYYY-MM-DD"
      ),
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
    const resp = await buyListItemStore.updateItem(item.id, {
      ...details,
      addedAt: moment(details.addedAt, "MMM D YYYY h:mm A").toISOString(),
      plannedDate: moment(details.plannedDate, "MMM D, YYYY").format(
        "YYYY-MM-DD"
      ),
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
    const resp = await buyListItemStore.deleteItem(item.id);
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
        title={item?.id ? "Edit Buy List Item" : "Buy List Item Creation Form"}
        details={details}
        setDetails={setDetails}
        onClickSubmit={item?.id ? onClickEdit : onClickCreate}
        hasDelete={!!item}
        onDelete={onClickDelete}
        objectName="buy list item"
        msg={msg}
        isLoading={isLoading}
      />
    </div>
  );
};
