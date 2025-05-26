import AddCardIcon from "@mui/icons-material/AddCard";
import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { useStore } from "../api/Store";
import { Task, TaskInterface } from "../api/TaskStore";
import { MyModal } from "../blueprints/MyModal";
import { MyMultiDropdownSelector } from "../blueprints/MyMultiDropdownSelector";
import { MySpeedDial } from "../blueprints/MySpeedDial";
import { MyTable } from "../blueprints/MyTable";
import { formatValue, sortByKey, toTitleCase } from "../constants/helpers";
import { TaskForm } from "./TaskForm";

export const TaskTableView = observer(() => {
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

  const matrix = useMemo(() => {
    const keys = Object.keys(new Task({}).$).filter((s) =>
      shownFields.includes(s as keyof TaskInterface)
    );
    const header = keys.map((k) => toTitleCase(k));
    const rows = sortByKey(taskStore.items, "dateCreated").map((item) =>
      keys.map((key) => {
        return formatValue(item[key as keyof TaskInterface], key);
      })
    );

    return [header, ...rows];
  }, [taskStore.items.length, shownFields.length]);

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
      <MyTable matrix={matrix} />
    </>
  );
});
