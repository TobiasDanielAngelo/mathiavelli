import AddCardIcon from "@mui/icons-material/AddCard";
import { observer } from "mobx-react-lite";
import moment from "moment";
import { useMemo, useState } from "react";
import { GoalInterface } from "../api/GoalStore";
import { useStore } from "../api/Store";
import { MyConfirmModal } from "../blueprints/MyConfirmModal";
import { MyModal } from "../blueprints/MyModal";
import { MySpeedDial } from "../blueprints/MySpeedDial";
import { GoalForm } from "./GoalForm";

export const GoalItem = observer(
  (props: { item: GoalInterface; border?: boolean }) => {
    const { item, border } = props;
    const [isVisible1, setVisible1] = useState(false);
    const [isVisible2, setVisible2] = useState(false);
    const [showChildren, setShowChildren] = useState(true);
    const [msg, setMsg] = useState("");
    const { goalStore } = useStore();

    const subgoals = goalStore.items.filter((g) => g.parentGoal === item.id);

    const onDelete = async () => {
      const resp = await goalStore.deleteItem(item?.id ?? -1);
      if (!resp.ok) {
        setMsg(resp.details);
        return;
      }
      setVisible1(false);
    };

    return (
      <div
        className="m-1 border-gray-700 rounded-lg p-2"
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

        <div className="flex justify-between">
          <div className="flex-1 mx-5">
            <div className="flex gap-2 text-xs text-gray-400">
              <div>
                {moment(item.dateCreated).format("MMM D, YYYY h:mm A ")}
              </div>
              <div>{item.description}</div>
            </div>
            <div className="flex items-center gap-2">
              {subgoals.length > 0 && (
                <div
                  onClick={() => setShowChildren((prev) => !prev)}
                  className="text-lg cursor-pointer mx-2 font-mono text-gray-500 hover:text-white"
                >
                  {showChildren ? "▾" : "▸"}
                </div>
              )}
              <div
                className="hover:underline cursor-pointer"
                onClick={() => setVisible1(true)}
              >
                {item.title}
              </div>
            </div>
          </div>
        </div>

        {showChildren && subgoals.length > 0 && (
          <div className="ml-8 mt-2 space-y-2 border-l-2 border-gray-500 pl-2">
            {subgoals.map((sub) => (
              <GoalItem key={sub.id} item={sub} />
            ))}
          </div>
        )}
      </div>
    );
  }
);

export const GoalView = observer(() => {
  const [isVisible1, setVisible1] = useState(false);
  const { goalStore } = useStore();

  const mainGoals = goalStore.items.filter((g) => g.parentGoal == -1);

  const actions = useMemo(
    () => [
      {
        icon: <AddCardIcon />,
        name: "Add a Goal",
        onClick: () => setVisible1(true),
      },
    ],
    []
  );

  return (
    <div className="items-center m-auto md:w-1/2 p-4 max-h-[85vh] overflow-scroll">
      <MyModal isVisible={isVisible1} setVisible={setVisible1} disableClose>
        <GoalForm setVisible={setVisible1} />
      </MyModal>
      <div className="space-y-2">
        {mainGoals.map((mainGoal) => (
          <GoalItem key={mainGoal.id} item={mainGoal} border />
        ))}
      </div>
      <MySpeedDial actions={actions} />
    </div>
  );
});
