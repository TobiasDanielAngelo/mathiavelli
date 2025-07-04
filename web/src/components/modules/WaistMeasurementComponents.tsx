import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { useStore } from "../../api/Store";
import {
  WaistMeasurement,
  WaistMeasurementFields,
  WaistMeasurementInterface,
} from "../../api/WaistMeasurementStore";
import { KV } from "../../blueprints/ItemDetails";
import { MyGenericCard } from "../../blueprints/MyGenericComponents/MyGenericCard";
import { MyGenericCollection } from "../../blueprints/MyGenericComponents/MyGenericCollection";
import { MyGenericFilter } from "../../blueprints/MyGenericComponents/MyGenericFilter";
import { MyGenericForm } from "../../blueprints/MyGenericComponents/MyGenericForm";
import { createGenericViewContext } from "../../blueprints/MyGenericComponents/MyGenericProps";
import { MyGenericRow } from "../../blueprints/MyGenericComponents/MyGenericRow";
import { MyGenericTable } from "../../blueprints/MyGenericComponents/MyGenericTable";
import {
  ActionModalDef,
  MyGenericView,
  useViewValues,
} from "../../blueprints/MyGenericComponents/MyGenericView";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { useVisible } from "../../constants/hooks";
import { Field } from "../../constants/interfaces";

export const {
  Context: WaistMeasurementViewContext,
  useGenericView: useWaistMeasurementView,
} = createGenericViewContext<WaistMeasurementInterface>();

const title = "Waist Measurements";

export const WaistMeasurementIdMap = {} as const;

export const WaistMeasurementForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: WaistMeasurement;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { waistMeasurementStore } = useStore();

  const fields = useMemo(
    () =>
      [
        [{ name: "waistCm", label: "Waist Cm", type: "text" }],
        [{ name: "date", label: "Date", type: "datetime" }],
      ] satisfies Field[][],
    []
  );

  return (
    <MyGenericForm<WaistMeasurementInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="waistMeasurement"
      fields={fields}
      store={waistMeasurementStore}
      datetimeFields={WaistMeasurementFields.datetimeFields}
      dateFields={WaistMeasurementFields.dateFields}
      timeFields={WaistMeasurementFields.timeFields}
    />
  );
};

export const WaistMeasurementCard = observer(
  (props: { item: WaistMeasurement }) => {
    const { item } = props;
    const { fetchFcn, shownFields } = useWaistMeasurementView();
    const { waistMeasurementStore } = useStore();

    return (
      <MyGenericCard
        item={item}
        shownFields={shownFields}
        header={["id"]}
        important={["waistCm"]}
        prices={WaistMeasurementFields.pricesFields}
        FormComponent={WaistMeasurementForm}
        deleteItem={waistMeasurementStore.deleteItem}
        fetchFcn={fetchFcn}
      />
    );
  }
);

export const WaistMeasurementCollection = observer(() => {
  const { waistMeasurementStore } = useStore();
  const { pageDetails, PageBar } = useWaistMeasurementView();

  return (
    <SideBySideView
      SideA={
        <MyGenericCollection
          CardComponent={WaistMeasurementCard}
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={waistMeasurementStore.items}
        />
      }
      SideB=""
      ratio={0.7}
    />
  );
});

export const WaistMeasurementFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new WaistMeasurement({}).$view}
      title="WaistMeasurement Filters"
      dateFields={[
        ...WaistMeasurementFields.datetimeFields,
        ...WaistMeasurementFields.dateFields,
      ]}
      excludeFields={["id"]}
      relatedFields={[]}
      optionFields={[]}
    />
  );
});

export const WaistMeasurementRow = observer(
  (props: { item: WaistMeasurement }) => {
    const { item } = props;
    const { fetchFcn } = useWaistMeasurementView();
    const { waistMeasurementStore } = useStore();

    return (
      <MyGenericRow
        item={item}
        FormComponent={WaistMeasurementForm}
        deleteItem={waistMeasurementStore.deleteItem}
        fetchFcn={fetchFcn}
      />
    );
  }
);

export const WaistMeasurementTable = observer(() => {
  const { waistMeasurementStore } = useStore();
  const values = useWaistMeasurementView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={waistMeasurementStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <WaistMeasurementRow item={item} />}
      priceFields={WaistMeasurementFields.pricesFields}
      {...values}
    />
  );
});

export const WaistMeasurementView = observer(() => {
  const { waistMeasurementStore, settingStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<WaistMeasurementInterface, WaistMeasurement>(
    settingStore,
    "WaistMeasurement",
    new WaistMeasurement({})
  );
  const { params, setPageDetails } = values;
  const fetchFcn = async () => {
    const resp = await waistMeasurementStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(() => [] satisfies KV<any>[], []);

  const actionModalDefs = [] satisfies ActionModalDef[];

  return (
    <MyGenericView<WaistMeasurementInterface>
      title={title}
      Context={WaistMeasurementViewContext}
      CollectionComponent={WaistMeasurementCollection}
      FormComponent={WaistMeasurementForm}
      FilterComponent={WaistMeasurementFilter}
      actionModalDefs={actionModalDefs}
      TableComponent={WaistMeasurementTable}
      fetchFcn={fetchFcn}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
