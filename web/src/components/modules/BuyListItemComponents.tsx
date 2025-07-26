import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import {
  BuyListItem,
  BuyListItemInterface,
  PRIORITY_CHOICES,
  WISHLIST_STATUS_CHOICES,
} from "../../api/BuyListItemStore";
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
  Context: BuyListItemViewContext,
  useGenericView: useBuyListItemView,
} = createGenericViewContext<BuyListItemInterface>();

const title = "Buy List Items";

export const BuyListItemIdMap = {} as const;

export const BuyListItemForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: BuyListItem;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { buyListItemStore } = useStore();

  const fields = useMemo(
    () =>
      [
        [{ name: "name", label: "Name", type: "text" }],
        [{ name: "estimatedPrice", label: "Estimated Price", type: "number" }],
        [{ name: "addedAt", label: "Added At", type: "datetime" }],
        [{ name: "plannedDate", label: "Planned Date", type: "date" }],
        [
          {
            name: "priority",
            label: "Priority",
            type: "select",
            options: toOptions(PRIORITY_CHOICES),
          },
        ],
        [
          {
            name: "status",
            label: "Status",
            type: "select",
            options: toOptions(WISHLIST_STATUS_CHOICES),
          },
        ],
      ] satisfies Field[][],
    []
  );

  return (
    <MyGenericForm<BuyListItemInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="buy list item"
      fields={fields}
      store={buyListItemStore}
      datetimeFields={buyListItemStore.datetimeFields}
      dateFields={buyListItemStore.dateFields}
      timeFields={buyListItemStore.timeFields}
    />
  );
};

export const BuyListItemCard = observer((props: { item: BuyListItem }) => {
  const { item } = props;
  const { fetchFcn, shownFields, itemMap, related } = useBuyListItemView();
  const { buyListItemStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id", "addedAt"]}
      important={["name"]}
      prices={buyListItemStore.priceFields}
      FormComponent={BuyListItemForm}
      deleteItem={buyListItemStore.deleteItem}
      fetchFcn={fetchFcn}
      itemMap={itemMap}
      related={related}
    />
  );
});

export const BuyListItemCollection = observer(() => {
  const { buyListItemStore } = useStore();
  const { pageDetails, PageBar } = useBuyListItemView();

  return (
    <SideBySideView
      SideA={
        <MyGenericCollection
          CardComponent={BuyListItemCard}
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={buyListItemStore.items}
        />
      }
      SideB=""
      ratio={0.7}
    />
  );
});

export const BuyListItemFilter = observer(() => {
  const { buyListItemStore } = useStore();

  return (
    <MyGenericFilter
      view={new BuyListItem({}).$view}
      title="Buy List Item Filters"
      dateFields={[
        ...buyListItemStore.dateFields,
        ...buyListItemStore.datetimeFields,
      ]}
      relatedFields={buyListItemStore.relatedFields}
      optionFields={buyListItemStore.optionFields}
    />
  );
});

export const BuyListItemRow = observer((props: { item: BuyListItem }) => {
  const { item } = props;
  const { fetchFcn } = useBuyListItemView();
  const { buyListItemStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={BuyListItemForm}
      deleteItem={buyListItemStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const BuyListItemTable = observer(() => {
  const { buyListItemStore } = useStore();
  const values = useBuyListItemView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={buyListItemStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <BuyListItemRow item={item} />}
      priceFields={buyListItemStore.priceFields}
      {...values}
    />
  );
});

export const BuyListItemView = observer(() => {
  const { buyListItemStore, settingStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<BuyListItemInterface, BuyListItem>(
    settingStore,
    "BuyListItem",
    new BuyListItem({})
  );
  const { params, setPageDetails } = values;
  const fetchFcn = async () => {
    const resp = await buyListItemStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(() => [] satisfies KV<any>[], []);

  const actionModalDefs = [] satisfies ActionModalDef[];

  return (
    <MyGenericView<BuyListItemInterface>
      title={title}
      Context={BuyListItemViewContext}
      CollectionComponent={BuyListItemCollection}
      FormComponent={BuyListItemForm}
      FilterComponent={BuyListItemFilter}
      fetchFcn={fetchFcn}
      actionModalDefs={actionModalDefs}
      isVisible={isVisible}
      setVisible={setVisible}
      TableComponent={BuyListItemTable}
      related={buyListItemStore.related}
      itemMap={itemMap}
      {...values}
    />
  );
});
