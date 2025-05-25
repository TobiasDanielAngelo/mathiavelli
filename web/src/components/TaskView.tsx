import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { useStore } from "../api/Store";
import { Task, TaskInterface } from "../api/TaskStore";
import { MyMultiDropdownSelector } from "../blueprints/MyMultiDropdownSelector";
import { sortByKey, toTitleCase } from "../constants/helpers";
import { TaskItem } from "./TaskItem";
import { MyModal } from "../blueprints/MyModal";
import { TaskForm } from "./TaskForm";
import { MySpeedDial } from "../blueprints/MySpeedDial";
import { SideBySideView } from "../blueprints/SideBySideView";
import AddCardIcon from "@mui/icons-material/AddCard";

export const TaskView = observer(() => {
  const { taskStore } = useStore();
  const [isVisible1, setVisible1] = useState(false);
  const [isVisible2, setVisible2] = useState(false);
  const [shownFields, setShownFields] = useState<(keyof TaskInterface)[]>(
    Object.keys(new Task({}).$) as (keyof TaskInterface)[]
  );

  const actions = useMemo(
    () => [
      {
        icon: (
          <div className="flex flex-col items-center">
            <AddCardIcon fontSize="large" />
            <div className="text-xs text-gray-500 font-bold">TASK</div>
          </div>
        ),
        name: "Add a Task",
        onClick: () => setVisible1(true),
      },
      {
        icon: (
          <div className="flex flex-col items-center">
            <AddCardIcon fontSize="large" />
            <div className="text-xs text-gray-500 font-bold">FIELDS</div>
          </div>
        ),
        name: "Filter Fields",
        onClick: () => setVisible2(true),
      },
    ],
    []
  );

  return (
    <>
      <MyModal isVisible={isVisible1} setVisible={setVisible1} disableClose>
        <TaskForm setVisible={setVisible1} />
      </MyModal>
      <MyModal isVisible={isVisible2} setVisible={setVisible2} disableClose>
        <MyMultiDropdownSelector
          label="Fields"
          value={shownFields}
          onChangeValue={(t) => setShownFields(t as (keyof TaskInterface)[])}
          options={Object.keys(new Task({}).$).map((s) => ({
            id: s,
            name: toTitleCase(s),
          }))}
          relative
          open
        />
      </MyModal>
      <MySpeedDial actions={actions} />

      <SideBySideView
        SideA=""
        SideB={sortByKey(taskStore.items, "dateCreated").map((s) => (
          <TaskItem item={s.$} key={s.id} shownFields={shownFields} />
        ))}
        ratio={0.7}
      />
      <div className="md:w-3/4 p-4 m-auto"></div>
    </>
  );
});
