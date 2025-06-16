import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useStore } from "../../api/Store";
import {
  WaistMeasurement,
  WaistMeasurementFields,
  WaistMeasurementInterface,
} from "../../api/WaistMeasurementStore";
import { MyMultiDropdownSelector } from "../../blueprints";
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
} from "../../blueprints/MyGenericComponents/MyGenericView";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { toTitleCase } from "../../constants/helpers";
import { useLocalStorageState, useVisible } from "../../constants/hooks";
import { Field, PaginatedDetails } from "../../constants/interfaces";

export const {
  Context: WaistMeasurementViewContext,
  useGenericView: useWaistMeasurementView,
} = createGenericViewContext<WaistMeasurementInterface>();

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
      storeFns={{
        add: waistMeasurementStore.addItem,
        update: waistMeasurementStore.updateItem,
        delete: waistMeasurementStore.deleteItem,
      }}
      datetimeFields={WaistMeasurementFields.datetime}
      dateFields={WaistMeasurementFields.date}
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
        prices={WaistMeasurementFields.prices}
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
      dateFields={WaistMeasurementFields.datetime}
      excludeFields={["id"]}
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
  const { shownFields, params, setParams, pageDetails, PageBar, itemMap } =
    useWaistMeasurementView();

  return (
    <MyGenericTable
      items={waistMeasurementStore.items}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <WaistMeasurementRow item={item} />}
      priceFields={WaistMeasurementFields.prices}
      itemMap={itemMap}
    />
  );
});

export const WaistMeasurementView = observer(() => {
  const { waistMeasurementStore } = useStore();
  const { setVisible1, isVisible, setVisible } = useVisible();
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const [params, setParams] = useSearchParams();
  const objWithFields = new WaistMeasurement({}).$;
  const [shownFields, setShownFields] = useLocalStorageState(
    Object.keys(objWithFields) as (keyof WaistMeasurementInterface)[],
    "shownFieldsWaistMeasurement"
  );
  const fetchFcn = async () => {
    const resp = await waistMeasurementStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(() => [] satisfies KV<any>[], []);

  const actionModalDefs = [
    {
      icon: "NoteAdd",
      label: "NEW",
      name: "Add a WaistMeasurement",
      modal: (
        <WaistMeasurementForm fetchFcn={fetchFcn} setVisible={setVisible1} />
      ),
    },
    {
      icon: "ViewList",
      label: "FIELDS",
      name: "Show Fields",
      modal: (
        <MyMultiDropdownSelector
          label="Fields"
          value={shownFields}
          onChangeValue={(t) =>
            setShownFields(t as (keyof WaistMeasurementInterface)[])
          }
          options={Object.keys(objWithFields).map((s) => ({
            id: s,
            name: toTitleCase(s),
          }))}
          relative
          open
        />
      ),
    },
    {
      icon: "FilterListAlt",
      label: "FILTERS",
      name: "Filters",
      modal: <WaistMeasurementFilter />,
    },
  ] satisfies ActionModalDef[];

  return (
    <MyGenericView<WaistMeasurementInterface>
      fetchFcn={fetchFcn}
      actionModalDefs={actionModalDefs}
      isVisible={isVisible}
      setVisible={setVisible}
      Context={WaistMeasurementViewContext}
      CollectionComponent={WaistMeasurementCollection}
      TableComponent={WaistMeasurementTable}
      shownFields={shownFields}
      setShownFields={setShownFields}
      availableGraphs={["pie", "line"]}
      pageDetails={pageDetails}
      params={params}
      setParams={setParams}
      itemMap={itemMap}
    />
  );
});
