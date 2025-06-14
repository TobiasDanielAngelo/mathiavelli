import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useVisible } from "../../constants/hooks";
import { ItemDetails, ItemDetailsProps } from "../ItemDetails";
import { MyConfirmModal } from "../MyConfirmModal";
import { IconName, MyIcon } from "../MyIcon";
import { MyModal } from "../MyModal";

export interface IAction {
  onClick: () => void;
  icon: IconName;
}

interface MyGenericCardProps<T> extends ItemDetailsProps<T> {
  FormComponent: React.ComponentType<{
    item: T;
    setVisible: (v: boolean) => void;
    fetchFcn: () => void;
  }>;
  deleteItem: (id: number) => Promise<{ ok: boolean; details?: string }>;
  fetchFcn: () => void;
  moreActions?: IAction[];
}

export const MyGenericCard = observer(
  <T extends object & { id: number }>({
    item,
    shownFields,
    header,
    important,
    body,
    prices,
    FormComponent,
    deleteItem,
    fetchFcn,
    moreActions,
  }: MyGenericCardProps<T>) => {
    const { isVisible1, setVisible1, isVisible2, setVisible2 } = useVisible();
    const [msg, setMsg] = useState("");

    const onDelete = async () => {
      const resp = await deleteItem(item.id);
      if (!resp.ok) {
        setMsg(resp.details ?? "Error");
        return;
      }
      setVisible2(false);
    };

    return (
      <div className="m-1 border-gray-700 rounded-lg p-5 border">
        <MyModal isVisible={isVisible1} setVisible={setVisible1}>
          <FormComponent
            item={item}
            setVisible={setVisible1}
            fetchFcn={fetchFcn}
          />
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
              <MyIcon
                icon="Close"
                onClick={() => setVisible2(true)}
                fontSize="small"
              />
            </div>

            <ItemDetails<T>
              item={item}
              shownFields={shownFields}
              header={header}
              important={important}
              body={body}
              prices={prices}
            />

            <div className="flex justify-between flex-row-reverse">
              <MyIcon
                icon="Edit"
                onClick={() => setVisible1(true)}
                fontSize="small"
              />
              {moreActions?.map((s, ind) => (
                <MyIcon
                  icon={s.icon}
                  onClick={s.onClick}
                  fontSize="small"
                  key={ind}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
);
