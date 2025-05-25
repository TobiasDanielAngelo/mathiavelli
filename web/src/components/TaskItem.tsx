import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useStore } from "../api/Store";
import { TaskInterface } from "../api/TaskStore";
import { ItemDetails } from "../blueprints/ItemDetails";
import { MyConfirmModal } from "../blueprints/MyConfirmModal";
import { MyModal } from "../blueprints/MyModal";
import { TaskForm } from "./TaskForm";
import { frequency } from "../constants/constants";

export const TaskItem = observer(
  (props: { item: TaskInterface; shownFields?: (keyof TaskInterface)[] }) => {
    const { item, shownFields } = props;
    const [isVisible1, setVisible1] = useState(false);
    const [isVisible2, setVisible2] = useState(false);
    const [msg, setMsg] = useState("");
    const { taskStore, goalStore } = useStore();

    const itemMap = [
      {
        key: "goal",
        values: goalStore.items.map((s) => s.$),
        label: "title",
      },
      {
        key: "repeat",
        values: frequency,
        label: "",
      },
    ];

    const onDelete = async () => {
      const resp = await taskStore.deleteItem(item?.id ?? -1);
      if (!resp.ok) {
        setMsg(resp.details);
        return;
      }
      setVisible1(false);
    };

    return (
      <div className="m-1 border-gray-700 rounded-lg p-5 border">
        <MyModal isVisible={isVisible1} setVisible={setVisible1}>
          <TaskForm item={item} setVisible={setVisible1} />
        </MyModal>
        <MyConfirmModal
          isVisible={isVisible2}
          setVisible={setVisible2}
          onClickCheck={onDelete}
          actionName="Delete"
          msg={msg}
        />

        <div className="flex justify-between">
          <div className="flex-1">
            <div className="flex justify-end">
              <CloseIcon
                onClick={() => setVisible2(true)}
                className="cursor-pointer"
                fontSize="small"
              />
            </div>
            <ItemDetails
              item={item}
              shownFields={shownFields}
              itemMap={itemMap}
              header={["dueDate"]}
              important={["title"]}
              body={[
                "description",
                "dateStart",
                "dateEnd",
                "isCancelled",
                "isCompleted",
                "repeat",
              ]}
            />
            <div className="flex justify-end">
              <EditIcon
                onClick={() => setVisible1(true)}
                className="cursor-pointer"
                fontSize="small"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);
