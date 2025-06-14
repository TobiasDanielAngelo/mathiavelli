import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import {
  Category,
  CATEGORY_CHOICES,
  CategoryFields,
  CategoryInterface,
} from "../../api/CategoryStore";
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

export const { Context: CategoryViewContext, useGenericView: useCategoryView } =
  createGenericViewContext<CategoryInterface>();

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
        <div className="flex flex-col min-h-[85vh]">
          <PageBar />
          <div className="flex-1">
            {sortAndFilterByIds(
              categoryStore.items,
              pageDetails?.ids ?? [],
              (s) => s.id
            ).map((s) => (
              <CategoryCard item={s} key={s.id} />
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

export const CategoryFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new Category({}).$}
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
  const { shownFields, params, setParams, pageDetails, PageBar } =
    useCategoryView();

  return (
    <MyGenericTable
      items={categoryStore.items}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <CategoryRow item={item} />}
      priceFields={CategoryFields.prices}
    />
  );
});
