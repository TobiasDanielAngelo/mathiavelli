import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { useStore } from "../api/Store";
import { MyButton } from "../blueprints/MyButton";
import { MyInput } from "../blueprints/MyInput";
import { MyTextArea } from "../blueprints/MyTextArea";
import { SideBySideView } from "../blueprints/SideBySideView";
import { getFirstTwoWords, sortByKey, toTitleCase } from "../constants/helpers";
import { JournalItem } from "./JournalItem";
import { Journal, JournalInterface } from "../api/JournalStore";
import AddIcon from "@mui/icons-material/Add";
import AddCardIcon from "@mui/icons-material/AddCard";
import { MyModal } from "../blueprints/MyModal";
import { JournalForm } from "./JournalForm";
import { MyMultiDropdownSelector } from "../blueprints/MyMultiDropdownSelector";
import { MySpeedDial } from "../blueprints/MySpeedDial";

export const JournalView = observer(() => {
  const { journalStore } = useStore();
  const [entry, setEntry] = useState({
    title: "",
    description: "",
  });

  const [isVisible1, setVisible1] = useState(false);
  const [isVisible2, setVisible2] = useState(false);
  const [shownFields, setShownFields] = useState<(keyof JournalInterface)[]>(
    Object.keys(new Journal({}).$) as (keyof JournalInterface)[]
  );

  const actions = useMemo(
    () => [
      {
        icon: (
          <div className="flex flex-col items-center">
            <AddCardIcon fontSize="large" />
            <div className="text-xs text-gray-500 font-bold">ENTRY</div>
          </div>
        ),
        name: "Add an Entry",
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
    <>
      <MyModal isVisible={isVisible1} setVisible={setVisible1} disableClose>
        <JournalForm setVisible={setVisible1} />
      </MyModal>
      <MyModal isVisible={isVisible2} setVisible={setVisible2} disableClose>
        <MyMultiDropdownSelector
          label="Fields"
          value={shownFields}
          onChangeValue={(t) => setShownFields(t as (keyof JournalInterface)[])}
          options={Object.keys(new Journal({}).$).map((s) => ({
            id: s,
            name: toTitleCase(s),
          }))}
          relative
          open
        />
      </MyModal>
      <MySpeedDial actions={actions} />
      <SideBySideView
        SideA={
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
        }
        SideB={
          journalStore.items.length ? (
            sortByKey(journalStore.items, "datetimeCreated", true).map((s) => (
              <JournalItem item={s} key={s.id} shownFields={shownFields} />
            ))
          ) : (
            <div className="justify-center items-center flex flex-col text-blue-400">
              <AddIcon
                fontSize="large"
                onClick={() => setVisible2(true)}
                className="cursor-pointer"
              />
              <div>Add a New Transaction</div>
            </div>
          )
        }
        ratio={0.7}
      />
    </>
  );
});
