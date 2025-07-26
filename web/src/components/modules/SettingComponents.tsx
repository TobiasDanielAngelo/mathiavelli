import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { Setting, SettingInterface } from "../../api/SettingStore";
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

export const { Context: SettingViewContext, useGenericView: useSettingView } =
  createGenericViewContext<SettingInterface>();

const title = "Settings";

export const SettingIdMap = {
  Theme: 1000001,
  UGW: 1000002,
  GW4: 1000003,
  GW3: 1000004,
  GW2: 1000005,
  GW1: 1000006,
} as const;

export const SettingForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: Setting;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { settingStore } = useStore();

  const fields = useMemo(
    () =>
      [
        [{ name: "key", label: "Key", type: "text" }],
        [
          {
            name: "value",
            label: "Value",
            type: "text",
          },
        ],
        [{ name: "description", label: "Description", type: "text" }],
      ] satisfies Field[][],
    []
  );

  return (
    <MyGenericForm<SettingInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="setting"
      fields={fields}
      store={settingStore}
      datetimeFields={settingStore.datetimeFields}
      dateFields={settingStore.dateFields}
      timeFields={settingStore.timeFields}
    />
  );
};

export const SettingCard = observer((props: { item: Setting }) => {
  const { item } = props;
  const { fetchFcn, shownFields, itemMap, related } = useSettingView();
  const { settingStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id"]}
      important={["key"]}
      prices={settingStore.priceFields}
      FormComponent={SettingForm}
      deleteItem={settingStore.deleteItem}
      fetchFcn={fetchFcn}
      itemMap={itemMap}
      related={related}
    />
  );
});

export const SettingCollection = observer(() => {
  const { settingStore } = useStore();
  const { pageDetails, PageBar } = useSettingView();

  return (
    <SideBySideView
      SideA={
        <MyGenericCollection
          CardComponent={SettingCard}
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={settingStore.items}
        />
      }
      SideB=""
      ratio={0.7}
    />
  );
});

export const SettingFilter = observer(() => {
  const { settingStore } = useStore();
  return (
    <MyGenericFilter
      view={new Setting({}).$view}
      title="Setting Filters"
      dateFields={[...settingStore.datetimeFields, ...settingStore.dateFields]}
      relatedFields={settingStore.relatedFields}
      optionFields={settingStore.optionFields}
    />
  );
});

export const SettingRow = observer((props: { item: Setting }) => {
  const { item } = props;
  const { fetchFcn } = useSettingView();
  const { settingStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={SettingForm}
      deleteItem={settingStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const SettingTable = observer(() => {
  const { settingStore } = useStore();
  const values = useSettingView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={settingStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <SettingRow item={item} />}
      priceFields={settingStore.priceFields}
      {...values}
    />
  );
});

export const SettingView = observer(() => {
  const { settingStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<SettingInterface, Setting>(
    settingStore,
    "Setting",
    new Setting({})
  );
  const { params, setPageDetails } = values;
  const fetchFcn = async () => {
    const resp = await settingStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(() => [] satisfies KV<any>[], []);

  const actionModalDefs = [] satisfies ActionModalDef[];

  return (
    <MyGenericView<SettingInterface>
      title={title}
      Context={SettingViewContext}
      CollectionComponent={SettingCollection}
      FormComponent={SettingForm}
      FilterComponent={SettingFilter}
      actionModalDefs={actionModalDefs}
      TableComponent={SettingTable}
      related={settingStore.related}
      fetchFcn={fetchFcn}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
