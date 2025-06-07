import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useStore } from "../../api/Store";
import { Goal, GoalInterface } from "../../api/GoalStore";
import { ItemDetails } from "../../blueprints/ItemDetails";
import { MyConfirmModal } from "../../blueprints/MyConfirmModal";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import { MyModal } from "../../blueprints/MyModal";
import { GoalForm } from "./GoalForm";
import { sortByKey } from "../../constants/helpers";
import { ItemRow } from "../../blueprints/ItemRow";
import { useVisible } from "../../constants/hooks";

export const GoalCard = observer(
  (props: {
    item: Goal;
    shownFields?: (keyof GoalInterface)[];
    border?: boolean;
  }) => {
    const { item, shownFields, border } = props;
    const {
      isVisible1,
      setVisible1,
      isVisible2,
      setVisible2,
      isVisible3,
      setVisible3,
    } = useVisible();
    const [msg, setMsg] = useState("");
    const { goalStore, taskStore } = useStore();

    const [showChildren, setShowChildren] = useState(true);
    const subgoals = goalStore.items.filter((g) => g.parentGoal === item.id);

    const onDelete = async () => {
      const resp = await goalStore.deleteItem(item?.id ?? -1);
      if (!resp.ok) {
        setMsg(resp.details);
        return;
      }
      setVisible2(false);
    };

    return (
      <div
        className="m-1 border-gray-700 rounded-lg p-5"
        style={{ borderWidth: border ? 1 : 0 }}
      >
        <MyModal isVisible={isVisible1} setVisible={setVisible1}>
          <GoalForm item={item} setVisible={setVisible1} />
        </MyModal>
        <MyConfirmModal
          isVisible={isVisible2}
          setVisible={setVisible2}
          onClickCheck={onDelete}
          actionName="Delete"
          msg={msg}
        />
        <MyModal isVisible={isVisible3} setVisible={setVisible3} title="Tasks">
          {sortByKey(taskStore.items, "id").filter((s) => s.goal === item.id)
            .length ? (
            sortByKey(taskStore.items, "id")
              .filter((s) => s.goal === item.id)
              .map((s) => (
                <ItemRow
                  key={s.id}
                  label={s.id + 98}
                  value={
                    <span className={`${s.isCompleted ? "line-through" : ""}`}>
                      {s.title}
                    </span>
                  }
                />
              ))
          ) : (
            <div className="text-white text-center">No Tasks Found.</div>
          )}
        </MyModal>

        <div className="flex justify-between">
          <div className="flex-1">
            <div className="flex flex-row">
              <div className="text-lg cursor-pointer mx-2 font-mono text-gray-500 flex flex-col justify-between">
                <div className="flex flex-col gap-2">
                  <CloseIcon
                    onClick={() => setVisible2(true)}
                    className="cursor-pointer hover:text-white"
                    fontSize="small"
                  />
                  <EditIcon
                    onClick={() => setVisible1(true)}
                    className="cursor-pointer hover:text-white"
                    fontSize="small"
                  />
                  <FormatListBulletedIcon
                    onClick={() => setVisible3(true)}
                    className="cursor-pointer hover:text-white"
                    fontSize="small"
                    titleAccess="Show Tasks"
                  />
                </div>
                {subgoals.length > 0 && (
                  <div
                    className="pl-5 hover:text-white text-2xl"
                    onClick={() => setShowChildren((prev) => !prev)}
                  >
                    {showChildren ? "▾" : "▸"}
                  </div>
                )}
              </div>
              <div className="flex-col w-full">
                <ItemDetails
                  item={item}
                  shownFields={shownFields}
                  important={["title"]}
                  body={[
                    "description",
                    "dateDuration",
                    "isCompleted",
                    "isCancelled",
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
        {showChildren && subgoals.length > 0 && (
          <div className="ml-8 mt-2 space-y-2 border-l-2 border-gray-500 pl-2">
            {subgoals.map((sub) => (
              <GoalCard key={sub.id} item={sub} shownFields={shownFields} />
            ))}
          </div>
        )}
      </div>
    );
  }
);
