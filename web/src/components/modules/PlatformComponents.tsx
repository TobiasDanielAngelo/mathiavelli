import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import {
  Platform,
  PlatformFields,
  PlatformInterface,
} from "../../api/PlatformStore";
import { useStore } from "../../api/Store";
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

export const { Context: PlatformViewContext, useGenericView: usePlatformView } =
  createGenericViewContext<PlatformInterface>();

const title = "Platforms";

export const PlatformIdMap = {
  Google: 1000001,
  GitHub: 1000002,
  Facebook: 1000003,
  Twitter: 1000004,
  Microsoft: 1000005,
  Apple: 1000006,
  Amazon: 1000007,
  Netflix: 1000008,
  Steam: 1000009,
  Spotify: 1000010,
} as const;

export const PlatformForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: Platform;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { platformStore } = useStore();

  const fields = useMemo(
    () => [[{ name: "name", label: "Name", type: "text" }]] satisfies Field[][],
    []
  );

  return (
    <MyGenericForm<PlatformInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="platform"
      fields={fields}
      store={platformStore}
      datetimeFields={PlatformFields.datetimeFields}
      dateFields={PlatformFields.dateFields}
      timeFields={PlatformFields.timeFields}
    />
  );
};

export const PlatformCard = observer((props: { item: Platform }) => {
  const { item } = props;
  const { fetchFcn, shownFields } = usePlatformView();
  const { platformStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id"]}
      important={["name"]}
      prices={PlatformFields.pricesFields}
      FormComponent={PlatformForm}
      deleteItem={platformStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const PlatformDashboard = observer(() => {
  return <></>;
});

export const PlatformCollection = observer(() => {
  const { platformStore } = useStore();
  const { pageDetails, PageBar } = usePlatformView();

  return (
    <SideBySideView
      SideA={
        <MyGenericCollection
          CardComponent={PlatformCard}
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={platformStore.items}
        />
      }
      SideB={<PlatformDashboard />}
      ratio={0.7}
    />
  );
});

export const PlatformFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new Platform({}).$view}
      title="Platform Filters"
      dateFields={[
        ...PlatformFields.dateFields,
        ...PlatformFields.datetimeFields,
      ]}
      excludeFields={["id"]}
      relatedFields={[]}
      optionFields={[]}
    />
  );
});

export const PlatformRow = observer((props: { item: Platform }) => {
  const { item } = props;
  const { fetchFcn } = usePlatformView();
  const { platformStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={PlatformForm}
      deleteItem={platformStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const PlatformTable = observer(() => {
  const { platformStore } = useStore();
  const values = usePlatformView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={platformStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <PlatformRow item={item} />}
      priceFields={PlatformFields.pricesFields}
      {...values}
    />
  );
});

export const PlatformView = observer(() => {
  const { platformStore, settingStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<PlatformInterface, Platform>(
    settingStore,
    "Platform",
    new Platform({})
  );
  const { params, setPageDetails } = values;
  const fetchFcn = async () => {
    const resp = await platformStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(() => [] satisfies KV<any>[], []);

  const actionModalDefs = [] satisfies ActionModalDef[];

  return (
    <MyGenericView<PlatformInterface>
      title={title}
      Context={PlatformViewContext}
      CollectionComponent={PlatformCollection}
      FormComponent={PlatformForm}
      FilterComponent={PlatformFilter}
      actionModalDefs={actionModalDefs}
      TableComponent={PlatformTable}
      fetchFcn={fetchFcn}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
