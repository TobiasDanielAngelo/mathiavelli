import moment from "moment";
import { useState } from "react";
import { MyForm } from "../MyForm";
import { Field } from "../../constants/interfaces";
import { toTitleCase } from "../../constants/helpers";

interface MyGenericFormProps<T> {
  item?: T & { id?: number };
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
  fields: Field[][];
  objectName: string;
  storeFns: {
    add: (item: T) => Promise<any>;
    update: (id: number, item: T) => Promise<any>;
    delete: (id: number) => Promise<any>;
  };
  dateFields?: (keyof T)[];
  datetimeFields?: (keyof T)[];
  timeFields?: (keyof T)[];
}

export function MyGenericForm<T>({
  item,
  setVisible,
  fetchFcn,
  fields,
  objectName,
  storeFns,
  dateFields = [],
  datetimeFields = [],
  timeFields = [],
}: MyGenericFormProps<T>) {
  const title = item?.id
    ? `Edit ${toTitleCase(objectName)}`
    : `${toTitleCase(objectName)} Creation Form`;

  const transformFrom = (raw: T): T => {
    const copy = { ...raw };
    dateFields.forEach((k) => {
      if (copy[k])
        copy[k] = moment(copy[k] as any).format("MMM D, YYYY") as any;
    });
    datetimeFields.forEach((k) => {
      if (copy[k])
        copy[k] = moment(copy[k] as any).format("MMM D YYYY h:mm A") as any;
    });
    timeFields.forEach((k) => {
      if (copy[k])
        copy[k] = moment(copy[k] as any, "HH:mm:ss").format("h:mm A") as any;
    });

    return copy;
  };

  const transformTo = (raw: T): T => {
    const copy = { ...raw };

    dateFields.forEach((k) => {
      const val = copy[k];
      if (val === "") {
        copy[k] = null as any;
      } else if (val) {
        copy[k] = moment(val as any, "MMM D, YYYY").format("YYYY-MM-DD") as any;
      }
    });

    datetimeFields.forEach((k) => {
      const val = copy[k];
      if (val === "") {
        copy[k] = null as any;
      } else if (val) {
        copy[k] = moment(val as any, "MMM D YYYY h:mm A").toISOString() as any;
      }
    });

    timeFields.forEach((k) => {
      const val = copy[k];
      if (val === "") {
        copy[k] = null as any;
      } else if (val) {
        copy[k] = moment(val as any, "h:mm A").format("HH:mm:ss") as any;
      }
    });

    return copy;
  };

  const [details, setDetails] = useState<T>(() =>
    item ? transformFrom(item as T) : ({} as T)
  );
  const [msg, setMsg] = useState<Object>();
  const [isLoading, setLoading] = useState(false);

  const onClickCreate = async () => {
    setLoading(true);
    const resp = await storeFns.add(transformTo(details));
    setLoading(false);
    if (!resp.ok) return setMsg(resp.details);
    fetchFcn?.();
    setVisible?.(false);
  };

  const onClickEdit = async () => {
    if (!item?.id) return;
    setLoading(true);
    const resp = await storeFns.update(item.id, transformTo(details));
    setLoading(false);
    if (!resp.ok) return setMsg(resp.details);
    fetchFcn?.();
    setVisible?.(false);
  };

  const onClickDelete = async () => {
    if (!item?.id) return;
    setLoading(true);
    const resp = await storeFns.delete(item.id);
    setLoading(false);
    if (!resp.ok) return setMsg(resp.details);
    fetchFcn?.();
    setVisible?.(false);
  };

  return (
    <div className="items-center">
      <MyForm
        fields={fields}
        title={title}
        details={details}
        setDetails={setDetails}
        onClickSubmit={item?.id ? onClickEdit : onClickCreate}
        hasDelete={!!item?.id}
        onDelete={onClickDelete}
        msg={msg}
        isLoading={isLoading}
      />
    </div>
  );
}
