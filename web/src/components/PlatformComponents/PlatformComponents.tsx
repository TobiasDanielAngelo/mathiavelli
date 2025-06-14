import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import {
  Platform,
  PlatformFields,
  PlatformInterface,
} from "../../api/PlatformStore";
import { useStore } from "../../api/Store";
import { MyGenericCard } from "../../blueprints/MyGenericComponents/MyGenericCard";
import { MyGenericFilter } from "../../blueprints/MyGenericComponents/MyGenericFilter";
import { MyGenericForm } from "../../blueprints/MyGenericComponents/MyGenericForm";
import { createGenericViewContext } from "../../blueprints/MyGenericComponents/MyGenericProps";
import { MyGenericRow } from "../../blueprints/MyGenericComponents/MyGenericRow";
import { MyGenericTable } from "../../blueprints/MyGenericComponents/MyGenericTable";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { sortAndFilterByIds } from "../../constants/helpers";
import { Field } from "../../constants/interfaces";

export const { Context: PlatformViewContext, useGenericView: usePlatformView } =
  createGenericViewContext<PlatformInterface>();

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
        <div className="flex flex-col min-h-[85vh]">
          <PageBar />
          <div className="flex-1">
            {sortAndFilterByIds(
              platformStore.items,
              pageDetails?.ids ?? [],
              (s) => s.id
            ).map((s) => (
              <PlatformCard item={s} key={s.id} />
            ))}
          </div>
          <PageBar />
        </div>
      }
      SideB={<PlatformDashboard />}
      ratio={0.7}
    />
  );
});

export const PlatformFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new Platform({}).$}
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
  const { shownFields, params, setParams, pageDetails, PageBar } =
    usePlatformView();

  return (
    <MyGenericTable
      items={platformStore.items}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <PlatformRow item={item} />}
    />
  );
});
