import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { useStore } from "../../api/Store";
import {
  WeighIn,
  WeighInFields,
  WeighInInterface,
} from "../../api/WeighInStore";
import { KV } from "../../blueprints/ItemDetails";
import { MyLineChart } from "../../blueprints/MyCharts/MyLineChart";
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

export const { Context: WeighInViewContext, useGenericView: useWeighInView } =
  createGenericViewContext<WeighInInterface>();

const title = "Weigh Ins";

export const WeighInIdMap = {} as const;

export const WeighInForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: WeighIn;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { weighInStore } = useStore();

  const fields = useMemo(
    () =>
      [
        [{ name: "weightKg", label: "Weight Kg", type: "text" }],
        [{ name: "date", label: "Date", type: "datetime" }],
      ] satisfies Field[][],
    []
  );

  return (
    <MyGenericForm<WeighInInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="weighIn"
      fields={fields}
      store={weighInStore}
      datetimeFields={WeighInFields.datetimeFields}
      dateFields={WeighInFields.dateFields}
      timeFields={WeighInFields.timeFields}
    />
  );
};

export const WeighInCard = observer((props: { item: WeighIn }) => {
  const { item } = props;
  const { fetchFcn, shownFields } = useWeighInView();
  const { weighInStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id", "date"]}
      prices={WeighInFields.pricesFields}
      FormComponent={WeighInForm}
      deleteItem={weighInStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const WeighInDashboard = observer(() => {
  const { weighInAnalyticsStore } = useStore();

  return (
    <MyLineChart
      data={weighInAnalyticsStore.items}
      xKey="period"
      yKey="aveWeight"
      formatter={(value: number, name: string) => [`${value} kg`, name]}
      noTotal
      title="Weigh In (kg)"
    />
  );
});

export const WeighInCollection = observer(() => {
  const { weighInStore } = useStore();
  const { pageDetails, PageBar } = useWeighInView();

  return (
    <SideBySideView
      SideA={
        <MyGenericCollection
          CardComponent={WeighInCard}
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={weighInStore.items}
        />
      }
      SideB={<WeighInDashboard />}
      ratio={0.7}
    />
  );
});

export const WeighInFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new WeighIn({}).$view}
      title="WeighIn Filters"
      dateFields={[
        ...WeighInFields.datetimeFields,
        ...WeighInFields.dateFields,
      ]}
      excludeFields={["id"]}
      relatedFields={[]}
      optionFields={[]}
    />
  );
});

export const WeighInRow = observer((props: { item: WeighIn }) => {
  const { item } = props;
  const { fetchFcn } = useWeighInView();
  const { weighInStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={WeighInForm}
      deleteItem={weighInStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const WeighInTable = observer(() => {
  const { weighInStore } = useStore();
  const values = useWeighInView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={weighInStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <WeighInRow item={item} />}
      priceFields={WeighInFields.pricesFields}
      {...values}
    />
  );
});

export const WeighInView = observer(() => {
  const { weighInStore, weighInAnalyticsStore, settingStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<WeighInInterface, WeighIn>(
    settingStore,
    "WeighIn",
    new WeighIn({})
  );
  const { params, setPageDetails } = values;
  const fetchFcn = async () => {
    const resp = await weighInStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
    weighInAnalyticsStore.fetchAll();
  };

  const itemMap = useMemo(() => [] satisfies KV<any>[], []);

  const actionModalDefs = [] satisfies ActionModalDef[];

  return (
    <MyGenericView<WeighInInterface>
      title={title}
      Context={WeighInViewContext}
      CollectionComponent={WeighInCollection}
      FormComponent={WeighInForm}
      FilterComponent={WeighInFilter}
      actionModalDefs={actionModalDefs}
      TableComponent={WeighInTable}
      fetchFcn={fetchFcn}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
