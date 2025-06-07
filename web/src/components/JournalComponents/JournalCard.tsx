import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useStore } from "../../api/Store";
import { Journal, JournalInterface } from "../../api/JournalStore";
import { ItemDetails } from "../../blueprints/ItemDetails";
import { MyConfirmModal } from "../../blueprints/MyConfirmModal";
import { MyModal } from "../../blueprints/MyModal";
import { JournalForm } from "./JournalForm";
import { useVisible } from "../../constants/hooks";

export const JournalCard = observer(
  (props: { item: Journal; shownFields?: (keyof JournalInterface)[] }) => {
    const { item, shownFields } = props;
    const { isVisible1, setVisible1, isVisible2, setVisible2 } = useVisible();
    const [msg, setMsg] = useState("");
    const { journalStore } = useStore();

    const onDelete = async () => {
      const resp = await journalStore.deleteItem(item?.id ?? -1);
      if (!resp.ok) {
        setMsg(resp.details);
        return;
      }
      setVisible2(false);
    };

    return (
      <div className="m-1 border-gray-700 rounded-lg p-5 border">
        <MyModal isVisible={isVisible1} setVisible={setVisible1}>
          <JournalForm item={item} setVisible={setVisible1} />
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
              header={["datetimeCreated"]}
              important={["title"]}
              body={["description"]}
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
