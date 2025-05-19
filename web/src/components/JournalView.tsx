import CloseIcon from "@mui/icons-material/Close";
import { observer } from "mobx-react-lite";
import moment from "moment";
import { useState } from "react";
import { JournalInterface } from "../api/JournalStore";
import { useStore } from "../api/Store";
import { MyButton } from "../blueprints/MyButton";
import { MyConfirmModal } from "../blueprints/MyConfirmModal";
import { MyInput } from "../blueprints/MyInput";
import { MyModal } from "../blueprints/MyModal";
import { MyTextArea } from "../blueprints/MyTextArea";
import { getFirstTwoWords, sortByKey } from "../constants/helpers";
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
      <div
        className="hover:underline cursor-pointer"
        onClick={() => setVisible1(true)}
      >
        <div className="text-xs text-left text-gray-400">
          {moment(item?.datetimeCreated).format("MMM D, YYYY h:mm A ")}
        </div>
        <div>{item?.title}</div>
        <div className="text-xs text-left text-gray-400">
          {item?.description}
        </div>
      </div>
      <CloseIcon onClick={() => setVisible2(true)} className="cursor-pointer" />
    </div>
  );
};

export const JournalView = observer(() => {
  const { journalStore } = useStore();
  const [entry, setEntry] = useState({
    title: "",
    description: "",
  });

  const onSubmit = async () => {
    await journalStore.addItem({
      title:
        entry.title.length > 0
          ? entry.title
          : getFirstTwoWords(entry.description),
      description: entry.description,
    });
    setEntry({
      title: "",
      description: "",
    });
  };

  return (
    <div className="lg:w-3/4 m-auto justify-center flex lg:flex-row flex-col">
      <div className="lg:w-1/2">
        <div className="m-4 items-end">
          <div className="w-full">
            <MyInput
              value={entry.title}
              onChangeValue={(t) => setEntry({ ...entry, title: t })}
              label={`Title (Optional)`}
            />
            <MyTextArea
              value={entry.description}
              onChangeValue={(t) => setEntry({ ...entry, description: t })}
              label={`Journal (${entry.description.length}/1000)`}
            />
          </div>
          <MyButton onClick={onSubmit} label="Submit" />
        </div>
      </div>
      <div className="lg:w-1/2 max-h-[85vh] overflow-scroll">
        {sortByKey(journalStore.items, "datetimeCreated", true).map((s) => (
          <JournalItem item={s} key={s.id} />
        ))}
      </div>
    </div>
  );
});
