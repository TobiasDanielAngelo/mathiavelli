import moment from "moment";
import { useMemo, useState } from "react";
import { PayableInterface } from "../../api/PayableStore";
import { useStore } from "../../api/Store";
import { MyForm } from "../../blueprints/MyForm";
import { toOptions } from "../../constants/helpers";
import { Field } from "../../constants/interfaces";

export const PayableForm = (props: {
  item?: PayableInterface;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { item, setVisible, fetchFcn } = props;
  const { payableStore, transactionStore } = useStore();
  const [details, setDetails] = useState<PayableInterface>({
    payment: item?.payment ?? [],
    lenderName: item?.lenderName,
    borrowedAmount: item?.borrowedAmount,
    description: item?.description,
    datetimeOpened: moment(item?.datetimeOpened).format("MMM D, YYYY h:mm A"),
    datetimeDue: moment(item?.datetimeDue).format("MMM D, YYYY h:mm A"),
    datetimeClosed: moment(item?.datetimeClosed).format("MMM D, YYYY h:mm A"),
    isActive: item?.isActive,
  });
  const [msg, setMsg] = useState<Object>();
  const [isLoading, setLoading] = useState(false);

  const rawFields = useMemo(
    () =>
      [
        [
          {
            name: "payment",
            label: "Payment",
            type: "multi",
            options: toOptions(transactionStore.items, "description"),
          },
        ],
        [{ name: "lenderName", label: "Lender Name", type: "text" }],
        [{ name: "borrowedAmount", label: "Borrowed Amount", type: "number" }],
        [{ name: "description", label: "Description", type: "text" }],
        [
          {
            name: "datetimeOpened",
            label: "Datetime Opened",
            type: "datetime",
          },
        ],
        [{ name: "datetimeDue", label: "Datetime Due", type: "datetime" }],
        [
          {
            name: "datetimeClosed",
            label: "Datetime Closed",
            type: "datetime",
          },
        ],
        [{ name: "isActive", label: "Is Active", type: "check" }],
      ] satisfies Field[][],
    [transactionStore.items.length]
  );

  const onClickCreate = async () => {
    setLoading(true);
    const resp = await payableStore.addItem({
      ...details,
      datetimeOpened: moment(
        details.datetimeOpened,
        "MMM D YYYY h:mm A"
      ).toISOString(),
      datetimeDue: moment(
        details.datetimeDue,
        "MMM D YYYY h:mm A"
      ).toISOString(),
      datetimeClosed: moment(
        details.datetimeClosed,
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
    const resp = await payableStore.updateItem(item.id, {
      ...details,
      datetimeOpened: moment(
        details.datetimeOpened,
        "MMM D YYYY h:mm A"
      ).toISOString(),
      datetimeDue: moment(
        details.datetimeDue,
        "MMM D YYYY h:mm A"
      ).toISOString(),
      datetimeClosed: moment(
        details.datetimeClosed,
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
    const resp = await payableStore.deleteItem(item.id);
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
        title={item?.id ? "Edit Payable" : "Payable Creation Form"}
        details={details}
        setDetails={setDetails}
        onClickSubmit={item ? onClickEdit : onClickCreate}
        hasDelete={!!item}
        onDelete={onClickDelete}
        objectName="payable"
        msg={msg}
        isLoading={isLoading}
      />
    </div>
  );
};
