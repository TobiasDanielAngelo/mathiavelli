import moment from "moment";
import { useMemo, useState } from "react";
import { GoalInterface } from "../../api/GoalStore";
import { useStore } from "../../api/Store";
import { MyForm } from "../../blueprints/MyForm";
import { Field } from "../../constants/interfaces";
import { observer } from "mobx-react-lite";
import { toOptions } from "../../constants/helpers";

export const getDescendantIds = (
  allGoals: GoalInterface[],
  goalId?: number
): number[] => {
  const directChildren = allGoals
    .filter((g) => g.parentGoal === goalId)
    .map((s) => s.id) as number[];
  const allDescendants = directChildren.flatMap((c) =>
    getDescendantIds(allGoals, c)
  );
  return [...directChildren, ...allDescendants];
};

export const GoalForm = observer(
  (props: {
    item?: GoalInterface;
    setVisible?: (t: boolean) => void;
    fetchFcn?: () => void;
  }) => {
    const { item, setVisible, fetchFcn } = props;
    const { goalStore } = useStore();
    const [details, setDetails] = useState({
      title: item?.title,
      description: item?.description,
      parentGoal: item?.parentGoal,
      isCompleted: item?.isCompleted,
      isCancelled: item?.isCancelled,
      dateCompleted: moment(item?.dateCompleted).format("MMM D, YYYY"),
      dateStart: moment(item?.dateStart).format("MMM D, YYYY"),
      dateEnd: moment(item?.dateEnd).format("MMM D, YYYY"),
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
            label: "Description",
            type: "textarea",
          },
        ],
        [
          {
            name: "parentGoal",
            label: "Parent Goal",
            type: "select",
            options: toOptions(
              goalStore.items.filter(
                (s) =>
                  s.id !== item?.id &&
                  !getDescendantIds(goalStore.items, item?.id ?? -1).includes(
                    s.id
                  )
              ),
              "title"
            ),
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
            name: "dateCompleted",
            label: "Date Completed",
            type: "date",
          },
        ],
      ],
      [goalStore.items.length, item?.id]
    ) as Field[][];

    const onClickCreate = async () => {
      setLoading(true);
      const resp = await goalStore.addItem({
        ...details,
        dateCompleted: moment(details?.dateCompleted, "MMM D, YYYY").format(
          "YYYY-MM-DD"
        ),
        dateStart: moment(details?.dateStart, "MMM D, YYYY").format(
          "YYYY-MM-DD"
        ),
        dateEnd: moment(details?.dateEnd, "MMM D, YYYY").format("YYYY-MM-DD"),
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
      const resp = await goalStore.updateItem(item.id, {
        ...details,
        parentGoal: details.parentGoal == -1 ? null : details.parentGoal,
        dateCompleted: moment(details?.dateCompleted, "MMM D, YYYY").format(
          "YYYY-MM-DD"
        ),
        dateStart: moment(details?.dateStart, "MMM D, YYYY").format(
          "YYYY-MM-DD"
        ),
        dateEnd: moment(details?.dateEnd, "MMM D, YYYY").format("YYYY-MM-DD"),
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
      const resp = await goalStore.deleteItem(item.id);
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
          title={item ? "Edit Goal" : "Goal Creation Form"}
          details={details}
          setDetails={setDetails}
          onClickSubmit={item ? onClickEdit : onClickCreate}
          hasDelete={!!item}
          onDelete={onClickDelete}
          objectName="goal"
          msg={msg}
          isLoading={isLoading}
        />
      </div>
    );
  }
);
