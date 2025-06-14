import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import {
  FollowUp,
  FollowUpFields,
  FollowUpInterface,
} from "../../api/FollowUpStore";
import { useStore } from "../../api/Store";
import { MyGenericCard } from "../../blueprints/MyGenericComponents/MyGenericCard";
import { MyGenericFilter } from "../../blueprints/MyGenericComponents/MyGenericFilter";
import { MyGenericForm } from "../../blueprints/MyGenericComponents/MyGenericForm";
import { createGenericViewContext } from "../../blueprints/MyGenericComponents/MyGenericProps";
import { MyGenericRow } from "../../blueprints/MyGenericComponents/MyGenericRow";
import { MyGenericTable } from "../../blueprints/MyGenericComponents/MyGenericTable";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { sortAndFilterByIds, toOptions } from "../../constants/helpers";
import { Field } from "../../constants/interfaces";

export const { Context: FollowUpViewContext, useGenericView: useFollowUpView } =
  createGenericViewContext<FollowUpInterface>();

export const FollowUpIdMap = {} as const;

export const FollowUpForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: FollowUp;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { followUpStore, jobStore } = useStore();

  const fields = useMemo(
    () =>
      [
        [
          {
            name: "job",
            label: "Job",
            type: "select",
            options: toOptions(jobStore.items, "company"),
          },
        ],
        [{ name: "date", label: "Date", type: "date" }],
        [{ name: "message", label: "Message", type: "textarea" }],
        [{ name: "status", label: "Status", type: "number" }],
        [{ name: "reply", label: "Reply", type: "textarea" }],
      ] satisfies Field[][],
    [jobStore.items.length]
  );
  return (
    <MyGenericForm<FollowUpInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="follow-up"
      fields={fields}
      storeFns={{
        add: followUpStore.addItem,
        update: followUpStore.updateItem,
        delete: followUpStore.deleteItem,
      }}
      datetimeFields={FollowUpFields.datetime}
      dateFields={FollowUpFields.date}
    />
  );
};

export const FollowUpCard = observer((props: { item: FollowUp }) => {
  const { item } = props;
  const { fetchFcn, shownFields } = useFollowUpView();
  const { followUpStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["date"]}
      important={["job"]}
      body={["status", "message", "reply"]}
      prices={FollowUpFields.prices}
      FormComponent={FollowUpForm}
      deleteItem={followUpStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const FollowUpCollection = observer(() => {
  const { followUpStore } = useStore();
  const { pageDetails, PageBar } = useFollowUpView();

  return (
    <SideBySideView
      SideA={
        <div className="flex flex-col min-h-[85vh]">
          <PageBar />
          <div className="flex-1">
            {sortAndFilterByIds(
              followUpStore.items,
              pageDetails?.ids ?? [],
              (s) => s.id
            ).map((s) => (
              <FollowUpCard item={s} key={s.id} />
            ))}
          </div>
          <PageBar />
        </div>
      }
      SideB=""
      ratio={0.7}
    />
  );
});

export const FollowUpFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new FollowUp({}).$}
      title="FollowUp Filters"
      dateFields={[...FollowUpFields.date, ...FollowUpFields.datetime]}
      excludeFields={["id"]}
    />
  );
});

export const FollowUpRow = observer((props: { item: FollowUp }) => {
  const { item } = props;
  const { fetchFcn } = useFollowUpView();
  const { followUpStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={FollowUpForm}
      deleteItem={followUpStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const FollowUpTable = observer(() => {
  const { followUpStore } = useStore();
  const { shownFields, params, setParams, pageDetails, PageBar } =
    useFollowUpView();

  return (
    <MyGenericTable
      items={followUpStore.items}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <FollowUpRow item={item} />}
    />
  );
});
