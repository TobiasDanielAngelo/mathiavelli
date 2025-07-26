import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { BodyFat, BodyFatInterface } from "../../api/BodyFatStore";
import { useStore } from "../../api/Store";
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
import { ActionModalDef, Field, KV } from "../../constants/interfaces";

export const { Context: BodyFatViewContext, useGenericView: useBodyFatView } =
  createGenericViewContext<BodyFatInterface>();

const title = "Body Fats";

export const BodyFatIdMap = {} as const;

export const BodyFatForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: BodyFat;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { bodyFatStore } = useStore();

  const fields = useMemo(
    () =>
      [
        [{ name: "bodyFatPercent", label: "Body Fat Percent", type: "text" }],
        [{ name: "date", label: "Date", type: "datetime" }],
      ] satisfies Field[][],
    []
  );

  return (
    <MyGenericForm<BodyFatInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="bodyFat"
      fields={fields}
      store={bodyFatStore}
      datetimeFields={bodyFatStore.datetimeFields}
      dateFields={bodyFatStore.dateFields}
      timeFields={bodyFatStore.timeFields}
    />
  );
};

export const BodyFatCard = observer((props: { item: BodyFat }) => {
  const { item } = props;
  const { fetchFcn, shownFields, itemMap, related } = useBodyFatView();
  const { bodyFatStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id"]}
      important={["bodyFatPercent"]}
      prices={bodyFatStore.priceFields}
      FormComponent={BodyFatForm}
      deleteItem={bodyFatStore.deleteItem}
      fetchFcn={fetchFcn}
      itemMap={itemMap}
      related={related}
    />
  );
});

export const BodyFatCollection = observer(() => {
  const { bodyFatStore } = useStore();
  const { pageDetails, PageBar } = useBodyFatView();

  return (
    <SideBySideView
      SideA={
        <MyGenericCollection
          CardComponent={BodyFatCard}
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={bodyFatStore.items}
        />
      }
      SideB=""
      ratio={0.7}
    />
  );
});

export const BodyFatFilter = observer(() => {
  const { bodyFatStore } = useStore();

  return (
    <MyGenericFilter
      view={new BodyFat({}).$view}
      title="BodyFat Filters"
      dateFields={[...bodyFatStore.datetimeFields, ...bodyFatStore.dateFields]}
      relatedFields={bodyFatStore.relatedFields}
      optionFields={bodyFatStore.optionFields}
    />
  );
});

export const BodyFatRow = observer((props: { item: BodyFat }) => {
  const { item } = props;
  const { fetchFcn } = useBodyFatView();
  const { bodyFatStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={BodyFatForm}
      deleteItem={bodyFatStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const BodyFatTable = observer(() => {
  const { bodyFatStore } = useStore();
  const values = useBodyFatView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={bodyFatStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <BodyFatRow item={item} />}
      priceFields={bodyFatStore.priceFields}
      {...values}
    />
  );
});

export const BodyFatView = observer(() => {
  const { bodyFatStore, settingStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<BodyFatInterface, BodyFat>(
    settingStore,
    "BodyFat",
    new BodyFat({})
  );
  const { params, setPageDetails } = values;
  const fetchFcn = async () => {
    const resp = await bodyFatStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(() => [] satisfies KV<any>[], []);

  const actionModalDefs = [] satisfies ActionModalDef[];

  return (
    <MyGenericView<BodyFatInterface>
      title={title}
      Context={BodyFatViewContext}
      CollectionComponent={BodyFatCollection}
      FormComponent={BodyFatForm}
      FilterComponent={BodyFatFilter}
      fetchFcn={fetchFcn}
      actionModalDefs={actionModalDefs}
      isVisible={isVisible}
      setVisible={setVisible}
      TableComponent={BodyFatTable}
      related={bodyFatStore.related}
      itemMap={itemMap}
      {...values}
    />
  );
});
