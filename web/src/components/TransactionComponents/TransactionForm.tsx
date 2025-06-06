import moment from "moment";
import { useMemo, useState } from "react";
import { useStore } from "../../api/Store";
import { TransactionInterface } from "../../api/TransactionStore";
import { MyForm } from "../../blueprints/MyForm";
import { Field } from "../../constants/interfaces";
import { toOptions } from "../../constants/helpers";
import { observer } from "mobx-react-lite";

export const TransactionForm = observer(
  (props: {
    item?: TransactionInterface;
    setVisible?: (t: boolean) => void;
    fetchFcn?: () => void;
  }) => {
    const { item, setVisible, fetchFcn } = props;
    const { transactionStore, accountStore, categoryStore } = useStore();
    const [details, setDetails] = useState({
      category: item?.category,
      description: item?.description,
      transmitter: item?.transmitter,
      receiver: item?.receiver,
      amount: item?.amount,
      datetimeTransacted: moment(item?.datetimeTransacted).format(
        "MMM D YYYY h:mm A"
      ),
      receivableId: item?.receivableId || null,
      payableId: item?.payableId || null,
    });
    const [msg, setMsg] = useState<Object>();
    const [isLoading, setLoading] = useState(false);

    const rawFields = useMemo(
      () =>
        [
          [
            {
              name: "category",
              label: "Category",
              type: "select",
              options: toOptions(categoryStore.items, "title"),
            },
            {
              name: "amount",
              label: "Amount",
              type: "number",
            },
          ],
          [
            {
              name: "description",
              label: "Description",
              type: "text",
            },
          ],
          [
            {
              name: "transmitter",
              label: "From...",
              type: "select",
              options: toOptions(
                accountStore.items.filter((s) => s.$.id !== details?.receiver),
                "name"
              ),
            },
            {
              name: "receiver",
              label: "To...",
              type: "select",
              options: toOptions(
                accountStore.items.filter(
                  (s) => s.$.id !== details?.transmitter
                ),
                "name"
              ),
            },
          ],
        ] satisfies Field[][],
      [
        accountStore.items.length,
        categoryStore.items.length,
        details?.transmitter,
        details?.receiver,
      ]
    );

    const onClickCreate = async () => {
      setLoading(true);
      const resp = await transactionStore.addItem({
        ...details,
        datetimeTransacted: moment(
          details.datetimeTransacted,
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
      const resp = await transactionStore.updateItem(item.id, {
        ...details,
        datetimeTransacted: moment(
          details.datetimeTransacted,
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
      const resp = await transactionStore.deleteItem(item.id);
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
          title={item?.id ? "Edit Transaction" : "Transaction Creation Form"}
          details={details}
          setDetails={setDetails}
          onClickSubmit={item?.id ? onClickEdit : onClickCreate}
          hasDelete={!!item}
          onDelete={onClickDelete}
          objectName="transaction"
          msg={msg}
          isLoading={isLoading}
        />
      </div>
    );
  }
);
