import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { ItemToBring, ItemToBringInterface } from "../../api/ItemToBringStore";
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
import { toOptions } from "../../constants/helpers";
import { useVisible } from "../../constants/hooks";
import { ActionModalDef, Field, KV } from "../../constants/interfaces";

export const {
  Context: ItemToBringViewContext,
  useGenericView: useItemToBringView,
} = createGenericViewContext<ItemToBringInterface>();

const title = "ItemToBrings";

export const ItemToBringIdMap = {} as const;

export const ItemToBringForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: Partial<ItemToBring>;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { itemToBringStore, personalItemStore, documentStore } = useStore();

  const fields = useMemo(
    () =>
      [
        [
          {
            name: "inventoryItem",
            label: "Inventory Item",
            type: "select",
            options: toOptions(personalItemStore.items, "name"),
          },
        ],
        [
          {
            name: "document",
            label: "Document",
            type: "select",
            options: toOptions(documentStore.items, "title"),
          },
        ],
        [{ name: "quantity", label: "Quantity", type: "text" }],
        [{ name: "packed", label: "Packed", type: "check" }],
      ] satisfies Field[][],
    [personalItemStore.items.length, documentStore.items.length]
  );

  return (
    <MyGenericForm<ItemToBringInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="itemToBring"
      fields={fields}
      store={itemToBringStore}
      datetimeFields={itemToBringStore.datetimeFields}
      dateFields={itemToBringStore.dateFields}
      timeFields={itemToBringStore.timeFields}
    />
  );
};

export const ItemToBringCard = observer((props: { item: ItemToBring }) => {
  const { item } = props;
  const { fetchFcn, shownFields, itemMap, related } = useItemToBringView();
  const { itemToBringStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id"]}
      important={[]}
      prices={itemToBringStore.priceFields}
      FormComponent={ItemToBringForm}
      deleteItem={itemToBringStore.deleteItem}
      fetchFcn={fetchFcn}
      itemMap={itemMap}
      related={related}
    />
  );
});

export const ItemToBringDashboard = observer(() => {
  return <></>;
});

export const ItemToBringCollection = observer(() => {
  const { itemToBringStore } = useStore();
  const { pageDetails, PageBar } = useItemToBringView();

  return (
    <SideBySideView
      SideA={
        <MyGenericCollection
          CardComponent={ItemToBringCard}
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={itemToBringStore.items}
        />
      }
      SideB={<ItemToBringDashboard />}
      ratio={0.7}
    />
  );
});

export const ItemToBringFilter = observer(() => {
  const { itemToBringStore } = useStore();
  return (
    <MyGenericFilter
      view={new ItemToBring({}).$view}
      title="ItemToBring Filters"
      dateFields={[
        ...itemToBringStore.datetimeFields,
        ...itemToBringStore.dateFields,
      ]}
      relatedFields={itemToBringStore.relatedFields}
      optionFields={itemToBringStore.optionFields}
    />
  );
});

export const ItemToBringRow = observer((props: { item: ItemToBring }) => {
  const { item } = props;
  const { fetchFcn } = useItemToBringView();
  const { itemToBringStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={ItemToBringForm}
      deleteItem={itemToBringStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const ItemToBringTable = observer(() => {
  const { itemToBringStore } = useStore();
  const values = useItemToBringView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={itemToBringStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <ItemToBringRow item={item} />}
      priceFields={itemToBringStore.priceFields}
      {...values}
    />
  );
});

export const ItemToBringView = observer(() => {
  const { itemToBringStore, settingStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<ItemToBringInterface, ItemToBring>(
    settingStore,
    "ItemToBring",
    new ItemToBring({})
  );
  const { params, setPageDetails } = values;
  const fetchFcn = async () => {
    const resp = await itemToBringStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(() => [] satisfies KV<any>[], []);

  const actionModalDefs = [] satisfies ActionModalDef[];

  return (
    <MyGenericView<ItemToBringInterface>
      title={title}
      Context={ItemToBringViewContext}
      CollectionComponent={ItemToBringCollection}
      FormComponent={ItemToBringForm}
      FilterComponent={ItemToBringFilter}
      actionModalDefs={actionModalDefs}
      TableComponent={ItemToBringTable}
      related={itemToBringStore.related}
      fetchFcn={fetchFcn}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
