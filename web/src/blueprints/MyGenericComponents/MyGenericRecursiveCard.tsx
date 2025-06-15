import { observer } from "mobx-react-lite";
import { useState } from "react";
import { ItemDetails } from "../../blueprints/ItemDetails";
import { useVisible } from "../../constants/hooks";
import { ItemDetailsProps } from "../ItemDetails";
import { MyConfirmModal } from "../MyConfirmModal";
import { MyIcon } from "../MyIcon";
import { MyModal } from "../MyModal";

interface MyGenericRecursiveCardProps<T> extends ItemDetailsProps<T> {
  FormComponent: React.ComponentType<{
    item: T;
    setVisible: (v: boolean) => void;
    fetchFcn: () => void;
  }>;
  deleteItem: (id: number) => Promise<{ ok: boolean; details?: string }>;
  fetchFcn: () => void;
  items: T[];
  parentKey: keyof T;
  border?: boolean;
}

export const MyGenericRecursiveCard = observer(
  <T extends object & { id: number }>({
    item,
    header,
    important,
    body,
    prices,
    shownFields,
    FormComponent,
    deleteItem,
    fetchFcn,
    items,
    parentKey,
    border,
  }: MyGenericRecursiveCardProps<T>) => {
    const { isVisible1, setVisible1, isVisible2, setVisible2 } = useVisible();
    const [msg, setMsg] = useState("");

    const subItems = items.filter((g) => g[parentKey] === item.id);
    const [showChildren, setShowChildren] = useState(true);

    const onDelete = async () => {
      const resp = await deleteItem(item?.id ?? -1);
      if (!resp.ok) {
        setMsg(resp.details ?? "Error");
        return;
      }
      setVisible2(false);
    };

    return (
      <div
        className="m-3 border-gray-700 rounded-lg p-5"
        style={{ borderWidth: border ? 1 : 0 }}
      >
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
            <div className="flex flex-row">
              <div className="text-lg cursor-pointer mx-2 font-mono text-gray-500 flex flex-col justify-between">
                <div className="flex flex-col gap-2">
                  <MyIcon
                    icon="Close"
                    onClick={() => setVisible2(true)}
                    fontSize="small"
                  />
                  <MyIcon
                    icon="Edit"
                    onClick={() => setVisible1(true)}
                    fontSize="small"
                  />
                </div>
                {subItems.length > 0 && (
                  <div
                    className="pl-5 hover:text-white text-2xl"
                    onClick={() => setShowChildren((prev) => !prev)}
                  >
                    {showChildren ? "▾" : "▸"}
                  </div>
                )}
              </div>
              <div className="flex-col w-full">
                <ItemDetails
                  item={item}
                  shownFields={shownFields}
                  header={header}
                  important={important}
                  body={body}
                  prices={prices}
                />
              </div>
            </div>
          </div>
        </div>
        {showChildren && subItems.length > 0 && (
          <div className="ml-8 mt-2 space-y-2 border-l-2 border-gray-500 pl-2">
            {subItems.map((s) => (
              <MyGenericRecursiveCard
                key={s.id}
                item={s}
                header={header}
                important={important}
                body={body}
                prices={prices}
                shownFields={shownFields}
                FormComponent={FormComponent}
                deleteItem={deleteItem}
                fetchFcn={fetchFcn}
                items={items}
                parentKey={parentKey}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);
