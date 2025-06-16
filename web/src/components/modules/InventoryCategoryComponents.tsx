import { observer } from "mobx-react-lite";
import {
  InventoryCategory,
  InventoryCategoryFields,
  InventoryCategoryInterface,
} from "../../api/InventoryCategoryStore";
import { useStore } from "../../api/Store";
import { MyGenericCard } from "../../blueprints/MyGenericComponents/MyGenericCard";
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
import { sortAndFilterByIds, toTitleCase } from "../../constants/helpers";
import { Field, PaginatedDetails } from "../../constants/interfaces";
import { MyMultiDropdownSelector } from "../../blueprints";
import { useLocalStorageState, useVisible } from "../../constants/hooks";
import { useSearchParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { KV } from "../../blueprints/ItemDetails";

export const { Context: InventoryCategoryViewContext, useGenericView: useInventoryCategoryView } =
  createGenericViewContext<InventoryCategoryInterface>();

export const InventoryCategoryIdMap = {
} as const;

export const InventoryCategoryForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: InventoryCategory;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const {  inventoryCategoryStore } = useStore();

  const fields = useMemo(
    () =>
      [
      [{ name: "name", label: "Name", type: "text",},],
      ] satisfies Field[][],
    []
  );

  return (
    <MyGenericForm<InventoryCategoryInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="inventoryCategory"
      fields={fields}
      storeFns={{
        add: inventoryCategoryStore.addItem,
        update: inventoryCategoryStore.updateItem,
        delete: inventoryCategoryStore.deleteItem,
      }}
      datetimeFields={InventoryCategoryFields.datetime}
      dateFields={InventoryCategoryFields.date}
    />
  );
};

export const InventoryCategoryCard = observer((props: { item: InventoryCategory }) => {
  const { item } = props;
  const { fetchFcn, shownFields } = useInventoryCategoryView();
  const { inventoryCategoryStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id"]}
      important={["name"]}
      prices={InventoryCategoryFields.prices}
      FormComponent={InventoryCategoryForm}
      deleteItem={inventoryCategoryStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const InventoryCategoryDashboard = observer(() => {
  return (
    <>
    </>
  );
});

export const InventoryCategoryCollection = observer(() => {
  const { inventoryCategoryStore } = useStore();
  const { pageDetails, PageBar } = useInventoryCategoryView();

  return (
    <SideBySideView
      SideA={
        <div className="flex flex-col min-h-[85vh]">
          <PageBar />
          <div className="flex-1">
            {sortAndFilterByIds(
              inventoryCategoryStore.items,
              pageDetails?.ids ?? [],
              (s) => s.id
            ).map((s) => (
              <InventoryCategoryCard item={s} key={s.id} />
            ))}
          </div>
          <PageBar />
        </div>
      }
      SideB={<InventoryCategoryDashboard />}
      ratio={0.7}
    />
  );
});

export const InventoryCategoryFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new InventoryCategory({}).$}
      title="InventoryCategory Filters"
      dateFields={InventoryCategoryFields.datetime}
      excludeFields={["id"]}
    />
  );
});

export const InventoryCategoryRow = observer((props: { item: InventoryCategory }) => {
  const { item } = props;
  const { fetchFcn } = useInventoryCategoryView();
  const { inventoryCategoryStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={InventoryCategoryForm}
      deleteItem={inventoryCategoryStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const InventoryCategoryTable = observer(() => {
  const { inventoryCategoryStore } = useStore();
  const { shownFields, params, setParams, pageDetails, PageBar, itemMap } =
    useInventoryCategoryView();

  return (
    <MyGenericTable
      items={inventoryCategoryStore.items}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <InventoryCategoryRow item={item} />}
      priceFields={InventoryCategoryFields.prices}
      itemMap={itemMap}
    />
  );
});

export const InventoryCategoryView = observer(() => {
  const { inventoryCategoryStore } = useStore();
  const { setVisible1, isVisible, setVisible } = useVisible();
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const [params, setParams] = useSearchParams();
  const objWithFields = new InventoryCategory({}).$;
  const [shownFields, setShownFields] = useLocalStorageState(
    Object.keys(objWithFields) as (keyof InventoryCategoryInterface)[],
    "shownFieldsInventoryCategory"
  );
  const fetchFcn = async () => {
    const resp = await inventoryCategoryStore.fetchAll(params.toString());
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
      name: "Add a InventoryCategory",
      modal: <InventoryCategoryForm fetchFcn={fetchFcn} setVisible={setVisible1} />,
    },
    {
      icon: "ViewList",
      label: "FIELDS",
      name: "Show Fields",
      modal: (
        <MyMultiDropdownSelector
          label="Fields"
          value={shownFields}
          onChangeValue={(t) => setShownFields(t as (keyof InventoryCategoryInterface)[])}
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
      modal: <InventoryCategoryFilter />,
    },
  ] satisfies ActionModalDef[];

  return (
    <MyGenericView<InventoryCategoryInterface>
      fetchFcn={fetchFcn}
      actionModalDefs={actionModalDefs}
      isVisible={isVisible}
      setVisible={setVisible}
      Context={InventoryCategoryViewContext}
      CollectionComponent={InventoryCategoryCollection}
      TableComponent={InventoryCategoryTable}
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
