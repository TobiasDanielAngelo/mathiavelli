import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import {
  Category,
  CATEGORY_CHOICES,
  CategoryFields,
  CategoryInterface,
} from "../../api/CategoryStore";
import { useStore } from "../../api/Store";
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
  useViewValues,
} from "../../blueprints/MyGenericComponents/MyGenericView";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { toOptions } from "../../constants/helpers";
import { useVisible } from "../../constants/hooks";
import { Field } from "../../constants/interfaces";

export const { Context: CategoryViewContext, useGenericView: useCategoryView } =
  createGenericViewContext<CategoryInterface>();

const title = "Categories";

export const CategoryIdMap = {
  "Receivable Payment": 1000001,
  "Payable Payment": 1000002,
  "Lend Money": 1000003,
} as const;

export const CategoryForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: Category;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { categoryStore } = useStore();

  const fields = useMemo(
    () =>
      [
        [
          {
            name: "title",
            label: "Title",
            type: "text",
          },
        ],
        [
          {
            name: "nature",
            label: "Nature",
            type: "select",
            options: toOptions(CATEGORY_CHOICES),
          },
        ],
        [
          {
            name: "logo",
            label: "Logo",
            type: "text",
          },
        ],
      ] satisfies Field[][],
    []
  );

  return (
    <MyGenericForm<CategoryInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="category"
      fields={fields}
      store={categoryStore}
      datetimeFields={CategoryFields.datetimeFields}
      dateFields={CategoryFields.dateFields}
      timeFields={CategoryFields.timeFields}
    />
  );
};

export const CategoryCard = observer((props: { item: Category }) => {
  const { item } = props;
  const { fetchFcn, shownFields, itemMap } = useCategoryView();
  const { categoryStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id"]}
      important={["title"]}
      prices={CategoryFields.pricesFields}
      FormComponent={CategoryForm}
      deleteItem={categoryStore.deleteItem}
      fetchFcn={fetchFcn}
      itemMap={itemMap}
    />
  );
});

export const CategoryCollection = observer(() => {
  const { categoryStore } = useStore();
  const { pageDetails, PageBar } = useCategoryView();

  return (
    <SideBySideView
      SideA={
        <MyGenericCollection
          CardComponent={CategoryCard}
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={categoryStore.items}
        />
      }
      SideB=""
      ratio={0.7}
    />
  );
});

export const CategoryFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new Category({}).$view}
      title="Category Filters"
      dateFields={[
        ...CategoryFields.dateFields,
        ...CategoryFields.datetimeFields,
      ]}
      excludeFields={["id", "natureName", "nature"]}
      optionFields={["nature"]}
    />
  );
});

export const CategoryRow = observer((props: { item: Category }) => {
  const { item } = props;
  const { fetchFcn } = useCategoryView();
  const { categoryStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={CategoryForm}
      deleteItem={categoryStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const CategoryTable = observer(() => {
  const { categoryStore } = useStore();
  const values = useCategoryView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={categoryStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <CategoryRow item={item} />}
      priceFields={CategoryFields.pricesFields}
      {...values}
    />
  );
});

export const CategoryView = observer(() => {
  const { categoryStore, settingStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<CategoryInterface, Category>(
    settingStore,
    "Category",
    new Category({})
  );
  const { params, setPageDetails } = values;
  const fetchFcn = async () => {
    const resp = await categoryStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(
    () =>
      [
        {
          key: "nature",
          values: CATEGORY_CHOICES,
          label: "",
        },
      ] satisfies KV<any>[],
    []
  );

  const actionModalDefs = [] satisfies ActionModalDef[];

  return (
    <MyGenericView<CategoryInterface>
      title={title}
      Context={CategoryViewContext}
      CollectionComponent={CategoryCollection}
      FormComponent={CategoryForm}
      FilterComponent={CategoryFilter}
      actionModalDefs={actionModalDefs}
      TableComponent={CategoryTable}
      fetchFcn={fetchFcn}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
