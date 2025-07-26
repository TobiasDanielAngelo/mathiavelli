import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import {
  InventoryCategory,
  InventoryCategoryInterface,
} from "../../api/InventoryCategoryStore";
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

export const {
  Context: InventoryCategoryViewContext,
  useGenericView: useInventoryCategoryView,
} = createGenericViewContext<InventoryCategoryInterface>();

const title = "Inventory Categories";

export const InventoryCategoryIdMap = {} as const;

export const InventoryCategoryForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: InventoryCategory;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { inventoryCategoryStore } = useStore();

  const fields = useMemo(
    () => [[{ name: "name", label: "Name", type: "text" }]] satisfies Field[][],
    []
  );

  return (
    <MyGenericForm<InventoryCategoryInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="inventoryCategory"
      fields={fields}
      store={inventoryCategoryStore}
      datetimeFields={inventoryCategoryStore.datetimeFields}
      dateFields={inventoryCategoryStore.dateFields}
      timeFields={inventoryCategoryStore.timeFields}
    />
  );
};

export const InventoryCategoryCard = observer(
  (props: { item: InventoryCategory }) => {
    const { item } = props;
    const { fetchFcn, shownFields, itemMap, related } =
      useInventoryCategoryView();
    const { inventoryCategoryStore } = useStore();

    return (
      <MyGenericCard
        item={item}
        shownFields={shownFields}
        header={["id"]}
        important={["name"]}
        prices={inventoryCategoryStore.priceFields}
        FormComponent={InventoryCategoryForm}
        deleteItem={inventoryCategoryStore.deleteItem}
        fetchFcn={fetchFcn}
        itemMap={itemMap}
        related={related}
      />
    );
  }
);

export const InventoryCategoryDashboard = observer(() => {
  return <></>;
});

export const InventoryCategoryCollection = observer(() => {
  const { inventoryCategoryStore } = useStore();
  const { pageDetails, PageBar } = useInventoryCategoryView();

  return (
    <SideBySideView
      SideA={
        <MyGenericCollection
          CardComponent={InventoryCategoryCard}
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={inventoryCategoryStore.items}
        />
      }
      SideB={<InventoryCategoryDashboard />}
      ratio={0.7}
    />
  );
});

export const InventoryCategoryFilter = observer(() => {
  const { inventoryCategoryStore } = useStore();
  return (
    <MyGenericFilter
      view={new InventoryCategory({}).$view}
      title="Inventory Category Filters"
      dateFields={[
        ...inventoryCategoryStore.datetimeFields,
        ...inventoryCategoryStore.dateFields,
      ]}
      relatedFields={inventoryCategoryStore.relatedFields}
      optionFields={inventoryCategoryStore.optionFields}
    />
  );
});

export const InventoryCategoryRow = observer(
  (props: { item: InventoryCategory }) => {
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
  }
);

export const InventoryCategoryTable = observer(() => {
  const { inventoryCategoryStore } = useStore();
  const values = useInventoryCategoryView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={inventoryCategoryStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <InventoryCategoryRow item={item} />}
      priceFields={inventoryCategoryStore.priceFields}
      {...values}
    />
  );
});

export const InventoryCategoryView = observer(() => {
  const { inventoryCategoryStore, settingStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<InventoryCategoryInterface, InventoryCategory>(
    settingStore,
    "InventoryCategory",
    new InventoryCategory({})
  );
  const { params, setPageDetails } = values;
  const fetchFcn = async () => {
    const resp = await inventoryCategoryStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(() => [] satisfies KV<any>[], []);

  const actionModalDefs = [] satisfies ActionModalDef[];

  return (
    <MyGenericView<InventoryCategoryInterface>
      title={title}
      Context={InventoryCategoryViewContext}
      CollectionComponent={InventoryCategoryCollection}
      FormComponent={InventoryCategoryForm}
      FilterComponent={InventoryCategoryFilter}
      actionModalDefs={actionModalDefs}
      TableComponent={InventoryCategoryTable}
      related={inventoryCategoryStore.related}
      fetchFcn={fetchFcn}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
