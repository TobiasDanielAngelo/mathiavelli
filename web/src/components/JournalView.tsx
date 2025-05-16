import CloseIcon from "@mui/icons-material/Close";
import { observer } from "mobx-react-lite";
import moment from "moment";
import { useState } from "react";
import { JournalInterface } from "../api/JournalStore";
import { useStore } from "../api/Store";
import { MyButton } from "../blueprints/MyButton";
import { MyConfirmModal } from "../blueprints/MyConfirmModal";
import { MyModal } from "../blueprints/MyModal";
import { MyTextArea } from "../blueprints/MyTextArea";
import { JournalForm } from "./JournalForm";

export const JournalItem = (props: { item?: JournalInterface }) => {
  const { item } = props;
  const [isVisible1, setVisible1] = useState(false);
  const [isVisible2, setVisible2] = useState(false);
  const [msg, setMsg] = useState("");
  const { journalStore } = useStore();

  const onDelete = async () => {
    const resp = await journalStore.deleteItem(item?.id ?? -1);
    if (!resp.ok) {
      setMsg(resp.details);
      return;
    }
    setVisible1(false);
  };

  return (
    <div className="flex justify-between m-2 border border-gray-500 rounded-lg p-2">
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
      <div>
        <div className="text-xs text-left text-gray-400">
          {moment(item?.datetimeCreated).format("MMM D, YYYY h:mm A ")}
        </div>
        <div
          className="hover:underline cursor-pointer"
          onClick={() => setVisible1(true)}
        >
          {item?.text}
        </div>
      </div>
      <CloseIcon onClick={() => setVisible2(true)} className="cursor-pointer" />
    </div>
  );
};

export const JournalView = observer(() => {
  const { journalStore } = useStore();
  const [text, setText] = useState("");

  const onSubmit = async () => {
    await journalStore.addItem({
      text: text,
    });
    setText("");
  };

  return (
    <div className="items-center m-auto md:w-1/2 p-4">
      <div className="flex flex-row space-x-2 w-full justify-center mb-4">
        <MyTextArea
          value={text}
          onChangeValue={(t) => setText(t)}
          label={`Journal (${text.length}/300)`}
        />
        <MyButton onClick={onSubmit} label="Submit" />
      </div>

      <div className="flex-1 w-full overflow-y-auto space-y-2">
        {journalStore.items.map((s) => (
          <JournalItem item={s} key={s.id} />
        ))}
      </div>
    </div>
  );
});
