import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { Dream, DreamFields, DreamInterface } from "../../api/DreamStore";
import { useStore } from "../../api/Store";
import { KV, ActionModalDef } from "../../constants/interfaces";
import { MyGenericCard } from "../../blueprints/MyGenericComponents/MyGenericCard";
import { MyGenericCollection } from "../../blueprints/MyGenericComponents/MyGenericCollection";
import { MyGenericFilter } from "../../blueprints/MyGenericComponents/MyGenericFilter";
import { MyGenericForm } from "../../blueprints/MyGenericComponents/MyGenericForm";
import { createGenericViewContext } from "../../blueprints/MyGenericComponents/MyGenericProps";
import { MyGenericRow } from "../../blueprints/MyGenericComponents/MyGenericRow";
import { MyGenericTable } from "../../blueprints/MyGenericComponents/MyGenericTable";
import {
  MyGenericView,
  useViewValues,
} from "../../blueprints/MyGenericComponents/MyGenericView";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { useVisible } from "../../constants/hooks";
import { Field } from "../../constants/interfaces";

export const { Context: DreamViewContext, useGenericView: useDreamView } =
  createGenericViewContext<DreamInterface>();

const title = "Dreams";

export const DreamIdMap = {} as const;

export const DreamForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: Dream;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { dreamStore } = useStore();

  const fields = useMemo(
    () =>
      [
        [
          {
            name: "entry",
            label: "Entry",
            type: "textarea",
          },
        ],
        [
          {
            name: "dateCreated",
            label: "Created",
            type: "date",
          },
        ],
      ] satisfies Field[][],
    []
  );

  return (
    <MyGenericForm<DreamInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="dream"
      fields={fields}
      store={dreamStore}
      datetimeFields={DreamFields.datetimeFields}
      dateFields={DreamFields.dateFields}
      timeFields={DreamFields.timeFields}
    />
  );
};

export const DreamCard = observer((props: { item: Dream }) => {
  const { item } = props;
  const { fetchFcn, shownFields, itemMap } = useDreamView();
  const { dreamStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id", "dateCreated"]}
      prices={DreamFields.pricesFields}
      FormComponent={DreamForm}
      deleteItem={dreamStore.deleteItem}
      fetchFcn={fetchFcn}
      itemMap={itemMap}
    />
  );
});

export const DreamDashboard = observer(() => {
  return <></>;
});

export const DreamCollection = observer(() => {
  const { dreamStore } = useStore();
  const { pageDetails, PageBar } = useDreamView();

  return (
    <SideBySideView
      SideA={
        <MyGenericCollection
          CardComponent={DreamCard}
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={dreamStore.items}
        />
      }
      SideB={<DreamDashboard />}
      ratio={0.7}
    />
  );
});

export const DreamFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new Dream({}).$view}
      title="Dream Filters"
      dateFields={[...DreamFields.dateFields, ...DreamFields.datetimeFields]}
      excludeFields={["id"]}
      relatedFields={[]}
      optionFields={[]}
    />
  );
});

export const DreamRow = observer((props: { item: Dream }) => {
  const { item } = props;
  const { fetchFcn } = useDreamView();
  const { dreamStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={DreamForm}
      deleteItem={dreamStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const DreamTable = observer(() => {
  const { dreamStore } = useStore();
  const values = useDreamView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={dreamStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <DreamRow item={item} />}
      priceFields={DreamFields.pricesFields}
      {...values}
    />
  );
});

export const DreamView = observer(() => {
  const { dreamStore, settingStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<DreamInterface, Dream>(
    settingStore,
    "Dream",
    new Dream({})
  );
  const { params, setPageDetails } = values;
  const fetchFcn = async () => {
    const resp = await dreamStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(() => [] satisfies KV<any>[], []);

  const actionModalDefs = [] satisfies ActionModalDef[];

  return (
    <MyGenericView<DreamInterface>
      title={title}
      Context={DreamViewContext}
      CollectionComponent={DreamCollection}
      FormComponent={DreamForm}
      FilterComponent={DreamFilter}
      actionModalDefs={actionModalDefs}
      TableComponent={DreamTable}
      fetchFcn={fetchFcn}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
