import AddCardIcon from "@mui/icons-material/AddCard";
import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { useStore } from "../api/Store";
import { Task, TaskInterface } from "../api/TaskStore";
import { MyModal } from "../blueprints/MyModal";
import { MyMultiDropdownSelector } from "../blueprints/MyMultiDropdownSelector";
import { MySpeedDial } from "../blueprints/MySpeedDial";
import { SideBySideView } from "../blueprints/SideBySideView";
import { sortByKey, toTitleCase } from "../constants/helpers";
import { GoalForm } from "./GoalForm";
import { GoalItem } from "./GoalItem";
import { TaskForm } from "./TaskForm";
import { TaskItem } from "./TaskItem";
import { Goal, GoalInterface } from "../api/GoalStore";

export const GoalView = observer(() => {
  const [isVisible1, setVisible1] = useState(false);
  const [isVisible2, setVisible2] = useState(false);
  const [isVisible3, setVisible3] = useState(false);
  const [isVisible4, setVisible4] = useState(false);
  const { goalStore, taskStore } = useStore();
  const [shownTaskFields, setShownTaskFields] = useState<
    (keyof TaskInterface)[]
  >(Object.keys(new Task({}).$) as (keyof TaskInterface)[]);
  const [shownGoalFields, setShownGoalFields] = useState<
    (keyof GoalInterface)[]
  >(Object.keys(new Goal({}).$) as (keyof GoalInterface)[]);
  const mainGoals = goalStore.items.filter((g) => g.parentGoal == -1);

  const actions = useMemo(
    () => [
      {
        icon: (
          <div className="flex flex-col items-center">
            <AddCardIcon fontSize="large" />
            <div className="text-xs text-gray-500 font-bold">GOAL</div>
          </div>
        ),
        name: "Add a Goal",
        onClick: () => setVisible1(true),
      },
      {
        icon: (
          <div className="flex flex-col items-center">
            <AddCardIcon fontSize="large" />
            <div className="text-xs text-gray-500 font-bold">TASK</div>
          </div>
        ),
        name: "Add a Task",
        onClick: () => setVisible2(true),
      },
      {
        icon: (
          <div className="flex flex-col items-center">
            <div className="text-xs text-gray-500 font-bold">TASK FIELDS</div>
          </div>
        ),
        name: "Filter Task Fields",
        onClick: () => setVisible3(true),
      },
      {
        icon: (
          <div className="flex flex-col items-center">
            <div className="text-xs text-gray-500 font-bold">GOAL FIELDS</div>
          </div>
        ),
        name: "Filter Goal Fields",
        onClick: () => setVisible4(true),
      },
    ],
    []
  );

  return (
    <>
      <MyModal isVisible={isVisible1} setVisible={setVisible1} disableClose>
        <GoalForm setVisible={setVisible1} />
      </MyModal>
      <MyModal isVisible={isVisible2} setVisible={setVisible2} disableClose>
        <TaskForm setVisible={setVisible2} />
      </MyModal>
      <MyModal isVisible={isVisible3} setVisible={setVisible3} disableClose>
        <MyMultiDropdownSelector
          label="Fields"
          value={shownTaskFields}
          onChangeValue={(t) =>
            setShownTaskFields(t as (keyof TaskInterface)[])
          }
          options={Object.keys(new Task({}).$).map((s) => ({
            id: s,
            name: toTitleCase(s),
          }))}
          relative
          open
        />
      </MyModal>
      <MyModal isVisible={isVisible4} setVisible={setVisible4} disableClose>
        <MyMultiDropdownSelector
          label="Fields"
          value={shownGoalFields}
          onChangeValue={(t) =>
            setShownGoalFields(t as (keyof GoalInterface)[])
          }
          options={Object.keys(new Goal({}).$).map((s) => ({
            id: s,
            name: toTitleCase(s),
          }))}
          relative
          open
        />
      </MyModal>
      <MySpeedDial actions={actions} />
      <SideBySideView
        SideA={sortByKey(taskStore.items, "dateCreated").map((s) => (
          <TaskItem item={s} key={s.id} shownFields={shownTaskFields} />
        ))}
        SideB={mainGoals.map((mainGoal) => (
          <GoalItem
            key={mainGoal.id}
            item={mainGoal}
            border
            shownFields={shownGoalFields}
          />
        ))}
        ratio={0.7}
      />
    </>
  );
});
