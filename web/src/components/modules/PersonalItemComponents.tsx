import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import {
  PersonalItem,
  PersonalItemInterface,
} from "../../api/PersonalItemStore";
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
  Context: PersonalItemViewContext,
  useGenericView: usePersonalItemView,
} = createGenericViewContext<PersonalItemInterface>();

const title = "Inventory";

export const PersonalItemIdMap = {} as const;

export const PersonalItemForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: PersonalItem;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { personalItemStore, inventoryCategoryStore } = useStore();

  const fields = useMemo(
    () =>
      [
        [{ name: "name", label: "Name", type: "text" }],
        [
          {
            name: "category",
            label: "Category",
            type: "select",
            options: toOptions(inventoryCategoryStore.items, "name"),
          },
        ],
        [{ name: "location", label: "Location", type: "text" }],
        [{ name: "quantity", label: "Quantity", type: "text" }],
        [{ name: "acquiredDate", label: "Acquired Date", type: "date" }],
        [{ name: "worth", label: "Worth (Total)", type: "text" }],
        [{ name: "notes", label: "Notes", type: "textarea" }],
        [{ name: "isImportant", label: "Is Important", type: "check" }],
      ] satisfies Field[][],
    [inventoryCategoryStore.items.length]
  );

  return (
    <MyGenericForm<PersonalItemInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="personalItem"
      fields={fields}
      store={personalItemStore}
      datetimeFields={personalItemStore.datetimeFields}
      dateFields={personalItemStore.dateFields}
      timeFields={personalItemStore.timeFields}
    />
  );
};

export const PersonalItemCard = observer((props: { item: PersonalItem }) => {
  const { item } = props;
  const { fetchFcn, shownFields, itemMap, related } = usePersonalItemView();
  const { personalItemStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id"]}
      important={["name"]}
      prices={personalItemStore.priceFields}
      FormComponent={PersonalItemForm}
      deleteItem={personalItemStore.deleteItem}
      fetchFcn={fetchFcn}
      itemMap={itemMap}
      related={related}
    />
  );
});

export const PersonalItemDashboard = observer(() => {
  return <></>;
});

export const PersonalItemCollection = observer(() => {
  const { personalItemStore } = useStore();
  const { pageDetails, PageBar } = usePersonalItemView();

  return (
    <SideBySideView
      SideA={
        <MyGenericCollection
          CardComponent={PersonalItemCard}
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={personalItemStore.items}
        />
      }
      SideB={<PersonalItemDashboard />}
      ratio={0.7}
    />
  );
});

export const PersonalItemFilter = observer(() => {
  const { personalItemStore } = useStore();
  return (
    <MyGenericFilter
      view={new PersonalItem({}).$}
      title="PersonalItem Filters"
      dateFields={[
        ...personalItemStore.datetimeFields,
        ...personalItemStore.dateFields,
      ]}
      relatedFields={personalItemStore.relatedFields}
      optionFields={personalItemStore.optionFields}
    />
  );
});

export const PersonalItemRow = observer((props: { item: PersonalItem }) => {
  const { item } = props;
  const { fetchFcn } = usePersonalItemView();
  const { personalItemStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={PersonalItemForm}
      deleteItem={personalItemStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const PersonalItemTable = observer(() => {
  const { personalItemStore } = useStore();
  const values = usePersonalItemView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={personalItemStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <PersonalItemRow item={item} />}
      priceFields={personalItemStore.priceFields}
      {...values}
    />
  );
});

export const PersonalItemView = observer(() => {
  const { personalItemStore, settingStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<PersonalItemInterface, PersonalItem>(
    settingStore,
    "PersonalItem",
    new PersonalItem({})
  );
  const { params, setPageDetails } = values;
  const fetchFcn = async () => {
    const resp = await personalItemStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(() => [] satisfies KV<any>[], []);

  const actionModalDefs = [] satisfies ActionModalDef[];

  return (
    <MyGenericView<PersonalItemInterface>
      title={title}
      Context={PersonalItemViewContext}
      CollectionComponent={PersonalItemCollection}
      FormComponent={PersonalItemForm}
      FilterComponent={PersonalItemFilter}
      actionModalDefs={actionModalDefs}
      TableComponent={PersonalItemTable}
      related={personalItemStore.related}
      fetchFcn={fetchFcn}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
