import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import {
  BuyListItem,
  BuyListItemFields,
  BuyListItemInterface,
  PRIORITY_CHOICES,
  WISHLIST_STATUS_CHOICES,
} from "../../api/BuyListItemStore";
import { useStore } from "../../api/Store";
import { MyGenericCard } from "../../blueprints/MyGenericComponents/MyGenericCard";
import { MyGenericFilter } from "../../blueprints/MyGenericComponents/MyGenericFilter";
import { MyGenericForm } from "../../blueprints/MyGenericComponents/MyGenericForm";
import { createGenericViewContext } from "../../blueprints/MyGenericComponents/MyGenericProps";
import { MyGenericRow } from "../../blueprints/MyGenericComponents/MyGenericRow";
import { MyGenericTable } from "../../blueprints/MyGenericComponents/MyGenericTable";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { sortAndFilterByIds, toOptions } from "../../constants/helpers";
import { Field } from "../../constants/interfaces";

export const {
  Context: BuyListItemViewContext,
  useGenericView: useBuyListItemView,
} = createGenericViewContext<BuyListItemInterface>();

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
    () => [
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
    ],
    []
  ) as Field[][];

  return (
    <MyGenericForm<BuyListItemInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="buy list item"
      fields={fields}
      storeFns={{
        add: buyListItemStore.addItem,
        update: buyListItemStore.updateItem,
        delete: buyListItemStore.deleteItem,
      }}
      datetimeFields={BuyListItemFields.datetime}
      dateFields={BuyListItemFields.date}
    />
  );
};

export const BuyListItemCard = observer((props: { item: BuyListItem }) => {
  const { item } = props;
  const { fetchFcn, shownFields } = useBuyListItemView();
  const { buyListItemStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["plannedDate"]}
      important={["name"]}
      body={["estimatedPrice"]}
      prices={BuyListItemFields.prices}
      FormComponent={BuyListItemForm}
      deleteItem={buyListItemStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const BuyListItemCollection = observer(() => {
  const { buyListItemStore } = useStore();
  const { pageDetails, PageBar } = useBuyListItemView();

  return (
    <SideBySideView
      SideA={
        <div className="flex flex-col min-h-[85vh]">
          <PageBar />
          <div className="flex-1">
            {sortAndFilterByIds(
              buyListItemStore.items,
              pageDetails?.ids ?? [],
              (s) => s.id
            ).map((s) => (
              <BuyListItemCard item={s} key={s.id} />
            ))}
          </div>
          <PageBar />
        </div>
      }
      SideB=""
      ratio={0.7}
    />
  );
});

export const BuyListItemFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new BuyListItem({}).$}
      title="Buy List Item Filters"
      dateFields={[...BuyListItemFields.date, ...BuyListItemFields.datetime]}
      excludeFields={["id"]}
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
  const { shownFields, params, setParams, pageDetails, PageBar } =
    useBuyListItemView();

  return (
    <MyGenericTable
      items={buyListItemStore.items}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <BuyListItemRow item={item} />}
    />
  );
});
