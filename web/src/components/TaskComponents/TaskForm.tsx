import moment from "moment";
import { useMemo, useState } from "react";
import { TaskInterface } from "../../api/TaskStore";
import { useStore } from "../../api/Store";
import { MyForm } from "../../blueprints/MyForm";
import { Field } from "../../constants/interfaces";
import { observer } from "mobx-react-lite";
import { toOptions } from "../../constants/helpers";
import { frequency } from "../../constants/constants";

export const TaskForm = observer(
  (props: {
    item?: TaskInterface;
    setVisible?: (t: boolean) => void;
    fetchFcn?: () => void;
  }) => {
    const { item, setVisible, fetchFcn } = props;
    const { taskStore, goalStore } = useStore();
    const [details, setDetails] = useState<TaskInterface>({
      title: item?.title,
      description: item?.description,
      goal: item?.goal,
      isCompleted: item?.isCompleted,
      isCancelled: item?.isCancelled,
      repeat: item?.repeat,
      dateCompleted: item?.dateCompleted
        ? moment(item?.dateCompleted).format("MMM D, YYYY")
        : null,
      dateStart: moment(item?.dateStart).format("MMM D, YYYY"),
      dateEnd: moment(item?.dateEnd).format("MMM D, YYYY"),
      dueDate: moment(item?.dueDate).format("MMM D, YYYY"),
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
              name: "description",
              label: "Description",
              type: "textarea",
            },
          ],
          [
            {
              name: "goal",
              label: "Goal",
              type: "select",
              options: toOptions(goalStore.items, "title"),
            },
          ],
          [
            {
              name: "isCompleted",
              label: "Complete?",
              type: "check",
            },
            {
              name: "isCancelled",
              label: "Cancel?",
              type: "check",
            },
            {
              name: "repeat",
              label: "Frequency",
              type: "select",
              options: toOptions(frequency),
            },
          ],

          [
            {
              name: "dateStart",
              label: "Date Start",
              type: "date",
            },
            {
              name: "dateEnd",
              label: "Date End",
              type: "date",
            },
          ],
          [
            {
              name: "dueDate",
              label: "Due Date",
              type: "date",
            },
            {
              name: "dateCompleted",
              label: "Date Completed",
              type: "date",
            },
          ],
        ] satisfies Field[][],
      [goalStore.items.length, item?.id]
    );

    const onClickCreate = async () => {
      setLoading(true);
      const resp = await taskStore.addItem({
        ...details,
        dateCompleted: details?.dateCompleted
          ? moment(details?.dateCompleted, "MMM D, YYYY").format("YYYY-MM-DD")
          : null,
        dateStart: moment(details?.dateStart, "MMM D, YYYY").format(
          "YYYY-MM-DD"
        ),
        dateEnd: moment(details?.dateEnd, "MMM D, YYYY").format("YYYY-MM-DD"),
        dueDate: moment(details?.dueDate, "MMM D, YYYY").format("YYYY-MM-DD"),
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
      const resp = await taskStore.updateItem(item.id, {
        ...details,
        dateCompleted: details?.dateCompleted
          ? moment(details?.dateCompleted, "MMM D, YYYY").format("YYYY-MM-DD")
          : null,
        dateStart: moment(details?.dateStart, "MMM D, YYYY").format(
          "YYYY-MM-DD"
        ),
        dateEnd: moment(details?.dateEnd, "MMM D, YYYY").format("YYYY-MM-DD"),
        dueDate: moment(details?.dueDate, "MMM D, YYYY").format("YYYY-MM-DD"),
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
      const resp = await taskStore.deleteItem(item.id);
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
          title={item?.id ? "Edit Task" : "Task Creation Form"}
          details={details}
          setDetails={setDetails}
          onClickSubmit={item ? onClickEdit : onClickCreate}
          hasDelete={!!item}
          onDelete={onClickDelete}
          objectName="task"
          msg={msg}
          isLoading={isLoading}
        />
      </div>
    );
  }
);
