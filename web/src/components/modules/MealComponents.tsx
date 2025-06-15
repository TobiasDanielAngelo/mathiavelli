import { observer } from "mobx-react-lite";
import {
  Meal,
  MEAL_CATEGORY_CHOICES,
  MealFields,
  MealInterface,
} from "../../api/MealStore";
import { useStore } from "../../api/Store";
import { MyGenericCard } from "../../blueprints/MyGenericComponents/MyGenericCard";
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
import {
  sortAndFilterByIds,
  toOptions,
  toTitleCase,
} from "../../constants/helpers";
import { Field, PaginatedDetails } from "../../constants/interfaces";
import { MyMultiDropdownSelector } from "../../blueprints";
import { useLocalStorageState, useVisible } from "../../constants/hooks";
import { useSearchParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { KV } from "../../blueprints/ItemDetails";

export const { Context: MealViewContext, useGenericView: useMealView } =
  createGenericViewContext<MealInterface>();

export const MealIdMap = {} as const;

export const MealForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: Meal;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { mealStore } = useStore();

  const fields = useMemo(
    () =>
      [
        [{ name: "name", label: "Name", type: "text" }],
        [
          {
            name: "category",
            label: "Category",
            type: "select",
            options: toOptions(MEAL_CATEGORY_CHOICES),
          },
        ],
        [{ name: "calories", label: "Calories", type: "text" }],
        [{ name: "date", label: "Date", type: "datetime" }],
      ] satisfies Field[][],
    []
  );

  return (
    <MyGenericForm<MealInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="meal"
      fields={fields}
      storeFns={{
        add: mealStore.addItem,
        update: mealStore.updateItem,
        delete: mealStore.deleteItem,
      }}
      datetimeFields={MealFields.datetime}
    />
  );
};

export const MealCard = observer((props: { item: Meal }) => {
  const { item } = props;
  const { fetchFcn, shownFields } = useMealView();
  const { mealStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id"]}
      important={["name", "categoryName"]}
      prices={MealFields.prices}
      FormComponent={MealForm}
      deleteItem={mealStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const MealCollection = observer(() => {
  const { mealStore } = useStore();
  const { pageDetails, PageBar } = useMealView();

  return (
    <SideBySideView
      SideA={
        <div className="flex flex-col min-h-[85vh]">
          <PageBar />
          <div className="flex-1">
            {sortAndFilterByIds(
              mealStore.items,
              pageDetails?.ids ?? [],
              (s) => s.id
            ).map((s) => (
              <MealCard item={s} key={s.id} />
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

export const MealFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new Meal({}).$view}
      title="Meal Filters"
      dateFields={MealFields.datetime}
      excludeFields={["id"]}
    />
  );
});

export const MealRow = observer((props: { item: Meal }) => {
  const { item } = props;
  const { fetchFcn } = useMealView();
  const { mealStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={MealForm}
      deleteItem={mealStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const MealTable = observer(() => {
  const { mealStore } = useStore();
  const { shownFields, params, setParams, pageDetails, PageBar, itemMap } =
    useMealView();

  return (
    <MyGenericTable
      items={mealStore.items}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <MealRow item={item} />}
      priceFields={MealFields.prices}
      itemMap={itemMap}
    />
  );
});

export const MealView = observer(() => {
  const { mealStore } = useStore();
  const { setVisible1, isVisible, setVisible } = useVisible();
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const [params, setParams] = useSearchParams();
  const objWithFields = new Meal({}).$;
  const [shownFields, setShownFields] = useLocalStorageState(
    Object.keys(objWithFields) as (keyof MealInterface)[],
    "shownFieldsMeal"
  );
  const fetchFcn = async () => {
    const resp = await mealStore.fetchAll(params.toString());
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
      name: "Add a Meal",
      modal: <MealForm fetchFcn={fetchFcn} setVisible={setVisible1} />,
    },
    {
      icon: "ViewList",
      label: "FIELDS",
      name: "Show Fields",
      modal: (
        <MyMultiDropdownSelector
          label="Fields"
          value={shownFields}
          onChangeValue={(t) => setShownFields(t as (keyof MealInterface)[])}
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
      modal: <MealFilter />,
    },
  ] satisfies ActionModalDef[];

  return (
    <MyGenericView<MealInterface>
      fetchFcn={fetchFcn}
      actionModalDefs={actionModalDefs}
      isVisible={isVisible}
      setVisible={setVisible}
      Context={MealViewContext}
      CollectionComponent={MealCollection}
      TableComponent={MealTable}
      shownFields={shownFields}
      setShownFields={setShownFields}
      availableGraphs={["pie", "line"]}
      pageDetails={pageDetails}
      params={params}
      setParams={setParams}
      itemMap={itemMap}
    />
  );
});
