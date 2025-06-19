import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useStore } from "../../api/Store";
import {
  WeighIn,
  WeighInFields,
  WeighInInterface,
} from "../../api/WeighInStore";
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
import MyTimelineChart from "../../blueprints/MyCharts/MyTimelineChart";

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
      storeFns={{
        add: weighInStore.addItem,
        update: weighInStore.updateItem,
        delete: weighInStore.deleteItem,
      }}
      datetimeFields={WeighInFields.datetime}
      dateFields={WeighInFields.date}
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
      header={["id"]}
      important={["weightKg"]}
      prices={WeighInFields.prices}
      FormComponent={WeighInForm}
      deleteItem={weighInStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const WeighInDashboard = observer(() => {
  return <MyTimelineChart />;
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
      dateFields={WeighInFields.datetime}
      excludeFields={["id"]}
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
  const {
    shownFields,
    params,
    setParams,
    pageDetails,
    PageBar,
    itemMap,
    sortFields,
    setSortFields,
  } = useWeighInView();

  return (
    <MyGenericTable
      items={weighInStore.items}
      shownFields={shownFields}
      sortFields={sortFields}
      setSortFields={setSortFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <WeighInRow item={item} />}
      priceFields={WeighInFields.prices}
      itemMap={itemMap}
    />
  );
});

export const WeighInView = observer(() => {
  const { weighInStore } = useStore();
  const { setVisible1, isVisible, setVisible } = useVisible();
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const [params, setParams] = useSearchParams();
  const objWithFields = new WeighIn({}).$;
  const [shownFields, setShownFields] = useLocalStorageState(
    Object.keys(objWithFields) as (keyof WeighInInterface)[],
    "shownFieldsWeighIn"
  );
  const [sortFields, setSortFields] = useLocalStorageState(
    [] as string[],
    "sortFieldsWeighIn"
  );
  const fetchFcn = async () => {
    const resp = await weighInStore.fetchAll(params.toString());
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
      name: "Add a WeighIn",
      modal: <WeighInForm fetchFcn={fetchFcn} setVisible={setVisible1} />,
    },
    {
      icon: "ViewList",
      label: "FIELDS",
      name: "Show Fields",
      modal: (
        <MyMultiDropdownSelector
          label="Fields"
          value={shownFields}
          onChangeValue={(t) => setShownFields(t as (keyof WeighInInterface)[])}
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
      modal: <WeighInFilter />,
    },
  ] satisfies ActionModalDef[];

  return (
    <MyGenericView<WeighInInterface>
      title={title}
      fetchFcn={fetchFcn}
      actionModalDefs={actionModalDefs}
      isVisible={isVisible}
      setVisible={setVisible}
      Context={WeighInViewContext}
      CollectionComponent={WeighInCollection}
      TableComponent={WeighInTable}
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
