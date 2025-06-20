import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Meal,
  MEAL_CATEGORY_CHOICES,
  MealFields,
  MealInterface,
} from "../../api/MealStore";
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

export const { Context: MealViewContext, useGenericView: useMealView } =
  createGenericViewContext<MealInterface>();

const title = "Meals";

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
      dateFields={MealFields.date}
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
        <MyGenericCollection
          CardComponent={MealCard}
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={mealStore.items}
        />
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
  const {
    shownFields,
    params,
    setParams,
    pageDetails,
    PageBar,
    itemMap,
    sortFields,
    setSortFields,
  } = useMealView();

  return (
    <MyGenericTable
      items={mealStore.items}
      shownFields={shownFields}
      sortFields={sortFields}
      setSortFields={setSortFields}
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
  const objWithFields = new Meal({}).$view;
  const [shownFields, setShownFields] = useLocalStorageState(
    Object.keys(objWithFields) as (keyof MealInterface)[],
    "shownFieldsMeal"
  );
  const [sortFields, setSortFields] = useLocalStorageState(
    [] as string[],
    "sortFieldsMeal"
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
      title={title}
      fetchFcn={fetchFcn}
      actionModalDefs={actionModalDefs}
      isVisible={isVisible}
      setVisible={setVisible}
      Context={MealViewContext}
      CollectionComponent={MealCollection}
      TableComponent={MealTable}
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
