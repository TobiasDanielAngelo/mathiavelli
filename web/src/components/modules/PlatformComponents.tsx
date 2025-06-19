import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Platform,
  PlatformFields,
  PlatformInterface,
} from "../../api/PlatformStore";
import { useStore } from "../../api/Store";
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
      storeFns={{
        add: platformStore.addItem,
        update: platformStore.updateItem,
        delete: platformStore.deleteItem,
      }}
      datetimeFields={PlatformFields.datetime}
      dateFields={PlatformFields.date}
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
      prices={PlatformFields.prices}
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
      dateFields={[...PlatformFields.date, ...PlatformFields.datetime]}
      excludeFields={["id"]}
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
  const {
    shownFields,
    params,
    setParams,
    pageDetails,
    PageBar,
    itemMap,
    sortFields,
    setSortFields,
  } = usePlatformView();

  return (
    <MyGenericTable
      items={platformStore.items}
      shownFields={shownFields}
      sortFields={sortFields}
      setSortFields={setSortFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <PlatformRow item={item} />}
      priceFields={PlatformFields.prices}
      itemMap={itemMap}
    />
  );
});

export const PlatformView = observer(() => {
  const { platformStore } = useStore();
  const { setVisible1, isVisible, setVisible } = useVisible();
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const [params, setParams] = useSearchParams();
  const objWithFields = new Platform({}).$;
  const [shownFields, setShownFields] = useLocalStorageState(
    Object.keys(objWithFields) as (keyof PlatformInterface)[],
    "shownFieldsPlatform"
  );
  const [sortFields, setSortFields] = useLocalStorageState(
    [] as string[],
    "sortFieldsPlatform"
  );
  const fetchFcn = async () => {
    const resp = await platformStore.fetchAll(params.toString());
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
      name: "Add a Platform",
      modal: <PlatformForm fetchFcn={fetchFcn} setVisible={setVisible1} />,
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
            setShownFields(t as (keyof PlatformInterface)[])
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
      modal: <PlatformFilter />,
    },
  ] satisfies ActionModalDef[];

  return (
    <MyGenericView<PlatformInterface>
      title={title}
      fetchFcn={fetchFcn}
      actionModalDefs={actionModalDefs}
      isVisible={isVisible}
      setVisible={setVisible}
      Context={PlatformViewContext}
      CollectionComponent={PlatformCollection}
      TableComponent={PlatformTable}
      shownFields={shownFields}
      setShownFields={setShownFields}
      sortFields={sortFields}
      setSortFields={setSortFields}
      availableGraphs={["pie", "line"]}
      pageDetails={pageDetails}
      params={params}
      setParams={setParams}
      itemMap={itemMap}
    />
  );
});
