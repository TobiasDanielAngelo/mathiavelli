import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BodyFat,
  BodyFatFields,
  BodyFatInterface,
} from "../../api/BodyFatStore";
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
  GraphType,
  MyGenericView,
} from "../../blueprints/MyGenericComponents/MyGenericView";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { toTitleCase } from "../../constants/helpers";
import { useLocalStorageState, useVisible } from "../../constants/hooks";
import { Field, PaginatedDetails } from "../../constants/interfaces";

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
      storeFns={{
        add: bodyFatStore.addItem,
        update: bodyFatStore.updateItem,
        delete: bodyFatStore.deleteItem,
      }}
      datetimeFields={BodyFatFields.datetime}
      dateFields={BodyFatFields.date}
    />
  );
};

export const BodyFatCard = observer((props: { item: BodyFat }) => {
  const { item } = props;
  const { fetchFcn, shownFields } = useBodyFatView();
  const { bodyFatStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id"]}
      important={["bodyFatPercent"]}
      prices={BodyFatFields.prices}
      FormComponent={BodyFatForm}
      deleteItem={bodyFatStore.deleteItem}
      fetchFcn={fetchFcn}
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
  return (
    <MyGenericFilter
      view={new BodyFat({}).$view}
      title="BodyFat Filters"
      dateFields={BodyFatFields.datetime}
      excludeFields={["id"]}
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
  const {
    shownFields,
    params,
    setParams,
    pageDetails,
    PageBar,
    itemMap,
    sortFields,
    setSortFields,
  } = useBodyFatView();

  return (
    <MyGenericTable
      items={bodyFatStore.items}
      shownFields={shownFields}
      sortFields={sortFields}
      setSortFields={setSortFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <BodyFatRow item={item} />}
      priceFields={BodyFatFields.prices}
      itemMap={itemMap}
    />
  );
});

export const BodyFatView = observer(() => {
  const { bodyFatStore } = useStore();
  const { setVisible1, isVisible, setVisible } = useVisible();
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const [params, setParams] = useSearchParams();
  const objWithFields = new BodyFat({}).$view;
  const [graph, setGraph] = useState<GraphType>("pie");
  const [shownFields, setShownFields] = useLocalStorageState(
    Object.keys(objWithFields) as (keyof BodyFatInterface)[],
    "shownFieldsBodyFat"
  );
  const [sortFields, setSortFields] = useLocalStorageState(
    [] as string[],
    "sortFieldsBodyFat"
  );
  const fetchFcn = async () => {
    const resp = await bodyFatStore.fetchAll(params.toString());
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
      name: "Add a BodyFat",
      modal: <BodyFatForm fetchFcn={fetchFcn} setVisible={setVisible1} />,
    },
    {
      icon: "ViewList",
      label: "FIELDS",
      name: "Show Fields",
      modal: (
        <MyMultiDropdownSelector
          label="Fields"
          value={shownFields}
          onChangeValue={(t) => setShownFields(t as (keyof BodyFatInterface)[])}
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
      modal: <BodyFatFilter />,
    },
  ] satisfies ActionModalDef[];

  return (
    <MyGenericView<BodyFatInterface>
      title={title}
      fetchFcn={fetchFcn}
      actionModalDefs={actionModalDefs}
      isVisible={isVisible}
      setVisible={setVisible}
      Context={BodyFatViewContext}
      CollectionComponent={BodyFatCollection}
      TableComponent={BodyFatTable}
      shownFields={shownFields}
      setShownFields={setShownFields}
      sortFields={sortFields}
      setSortFields={setSortFields}
      availableGraphs={["pie", "line"]}
      pageDetails={pageDetails}
      params={params}
      setParams={setParams}
      itemMap={itemMap}
      graph={graph}
      setGraph={setGraph}
    />
  );
});
