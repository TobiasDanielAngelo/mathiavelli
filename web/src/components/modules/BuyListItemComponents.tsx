import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BuyListItem,
  BuyListItemFields,
  BuyListItemInterface,
  PRIORITY_CHOICES,
  WISHLIST_STATUS_CHOICES,
} from "../../api/BuyListItemStore";
import { STATUS_CHOICES } from "../../api/JobStore";
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
  MyGenericView,
} from "../../blueprints/MyGenericComponents/MyGenericView";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { toOptions, toTitleCase } from "../../constants/helpers";
import { useLocalStorageState, useVisible } from "../../constants/hooks";
import { Field, PaginatedDetails } from "../../constants/interfaces";

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
      body={["estimatedPrice", "priorityName", "statusName"]}
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
  const {
    shownFields,
    params,
    setParams,
    pageDetails,
    PageBar,
    itemMap,
    sortFields,
    setSortFields,
  } = useBuyListItemView();

  return (
    <MyGenericTable
      items={buyListItemStore.items}
      shownFields={shownFields}
      sortFields={sortFields}
      setSortFields={setSortFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <BuyListItemRow item={item} />}
      priceFields={BuyListItemFields.prices}
      itemMap={itemMap}
    />
  );
});

export const BuyListItemView = observer(() => {
  const { buyListItemStore } = useStore();
  const { setVisible1, isVisible, setVisible } = useVisible();
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const [params, setParams] = useSearchParams();
  const objWithFields = new BuyListItem({}).$;
  const [shownFields, setShownFields] = useLocalStorageState(
    Object.keys(objWithFields) as (keyof BuyListItemInterface)[],
    "shownFieldsBuyListItem"
  );
  const [sortFields, setSortFields] = useLocalStorageState(
    [] as string[],
    "sortFieldsBuyListItem"
  );
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

  const actionModalDefs = [
    {
      icon: "NoteAdd",
      label: "NEW",
      name: "Add a Wish List",
      modal: <BuyListItemForm fetchFcn={fetchFcn} setVisible={setVisible1} />,
    },
    {
      icon: "ViewList",
      label: "FIELDS",
      name: "Show Fields",
      modal: (
        <MyMultiDropdownSelector
          label="Fields"
          value={shownFields}
          onChangeValue={(t) =>
            setShownFields(t as (keyof BuyListItemInterface)[])
          }
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
      modal: <BuyListItemFilter />,
    },
  ] satisfies ActionModalDef[];

  return (
    <MyGenericView<BuyListItemInterface>
      title={title}
      fetchFcn={fetchFcn}
      actionModalDefs={actionModalDefs}
      isVisible={isVisible}
      setVisible={setVisible}
      Context={BuyListItemViewContext}
      CollectionComponent={BuyListItemCollection}
      TableComponent={BuyListItemTable}
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
