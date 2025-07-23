import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import {
  BuyListItem,
  BuyListItemFields,
  BuyListItemInterface,
  PRIORITY_CHOICES,
  WISHLIST_STATUS_CHOICES,
} from "../../api/BuyListItemStore";
import { STATUS_CHOICES } from "../../api/JobStore";
import { useStore } from "../../api/Store";
import { KV, ActionModalDef } from "../../constants/interfaces";
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
import { Field } from "../../constants/interfaces";

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
      datetimeFields={BuyListItemFields.datetimeFields}
      dateFields={BuyListItemFields.dateFields}
      timeFields={BuyListItemFields.timeFields}
    />
  );
};

export const BuyListItemCard = observer((props: { item: BuyListItem }) => {
  const { item } = props;
  const { fetchFcn, shownFields, itemMap } = useBuyListItemView();
  const { buyListItemStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id", "addedAt"]}
      important={["name"]}
      prices={BuyListItemFields.pricesFields}
      FormComponent={BuyListItemForm}
      deleteItem={buyListItemStore.deleteItem}
      fetchFcn={fetchFcn}
      itemMap={itemMap}
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
  return (
    <MyGenericFilter
      view={new BuyListItem({}).$view}
      title="Buy List Item Filters"
      dateFields={[
        ...BuyListItemFields.dateFields,
        ...BuyListItemFields.datetimeFields,
      ]}
      excludeFields={["id"]}
      relatedFields={["priorityName", "statusName"]}
      optionFields={[]}
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
      priceFields={BuyListItemFields.pricesFields}
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

  const itemMap = useMemo(
    () =>
      [
        {
          key: "status",
          values: STATUS_CHOICES,
          label: "",
        },
        {
          key: "priority",
          values: PRIORITY_CHOICES,
          label: "",
        },
      ] satisfies KV<any>[],
    []
  );

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
      itemMap={itemMap}
      {...values}
    />
  );
});
