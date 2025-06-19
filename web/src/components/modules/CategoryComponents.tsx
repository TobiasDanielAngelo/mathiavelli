import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Category,
  CATEGORY_CHOICES,
  CategoryFields,
  CategoryInterface,
} from "../../api/CategoryStore";
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

export const { Context: CategoryViewContext, useGenericView: useCategoryView } =
  createGenericViewContext<CategoryInterface>();

const title = "Categories";

export const CategoryIdMap = {
  "Receivable Payment": 1000001,
  "Payable Payment": 1000002,
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
      storeFns={{
        add: categoryStore.addItem,
        update: categoryStore.updateItem,
        delete: categoryStore.deleteItem,
      }}
      datetimeFields={CategoryFields.datetime}
      dateFields={CategoryFields.date}
    />
  );
};

export const CategoryCard = observer((props: { item: Category }) => {
  const { item } = props;
  const { fetchFcn, shownFields } = useCategoryView();
  const { categoryStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id"]}
      important={["title"]}
      body={["natureName", "logo"]}
      prices={CategoryFields.prices}
      FormComponent={CategoryForm}
      deleteItem={categoryStore.deleteItem}
      fetchFcn={fetchFcn}
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
      dateFields={[...CategoryFields.date, ...CategoryFields.datetime]}
      excludeFields={["id"]}
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
  const {
    shownFields,
    params,
    setParams,
    pageDetails,
    PageBar,
    itemMap,
    sortFields,
    setSortFields,
  } = useCategoryView();

  return (
    <MyGenericTable
      items={categoryStore.items}
      shownFields={shownFields}
      sortFields={sortFields}
      setSortFields={setSortFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <CategoryRow item={item} />}
      priceFields={CategoryFields.prices}
      itemMap={itemMap}
    />
  );
});

export const CategoryView = observer(() => {
  const { categoryStore } = useStore();
  const { setVisible1, isVisible, setVisible } = useVisible();
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const [params, setParams] = useSearchParams();
  const objWithFields = new Category({}).$;
  const [shownFields, setShownFields] = useLocalStorageState(
    Object.keys(objWithFields) as (keyof CategoryInterface)[],
    "shownFieldsCategory"
  );
  const [sortFields, setSortFields] = useLocalStorageState(
    [] as string[],
    "sortFieldsCategory"
  );
  const fetchFcn = async () => {
    const resp = await categoryStore.fetchAll(params.toString());
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
      name: "Add a Wish List",
      modal: <CategoryForm fetchFcn={fetchFcn} setVisible={setVisible1} />,
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
            setShownFields(t as (keyof CategoryInterface)[])
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
      modal: <CategoryFilter />,
    },
  ] satisfies ActionModalDef[];

  return (
    <MyGenericView<CategoryInterface>
      title={title}
      fetchFcn={fetchFcn}
      actionModalDefs={actionModalDefs}
      isVisible={isVisible}
      setVisible={setVisible}
      Context={CategoryViewContext}
      CollectionComponent={CategoryCollection}
      TableComponent={CategoryTable}
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
