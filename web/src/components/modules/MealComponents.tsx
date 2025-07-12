import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import {
  Meal,
  MEAL_CATEGORY_CHOICES,
  MealFields,
  MealInterface,
} from "../../api/MealStore";
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
      store={mealStore}
      datetimeFields={MealFields.datetimeFields}
      dateFields={MealFields.dateFields}
      timeFields={MealFields.timeFields}
    />
  );
};

export const MealCard = observer((props: { item: Meal }) => {
  const { item } = props;
  const { fetchFcn, shownFields, itemMap } = useMealView();
  const { mealStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id"]}
      important={["name"]}
      prices={MealFields.pricesFields}
      FormComponent={MealForm}
      deleteItem={mealStore.deleteItem}
      fetchFcn={fetchFcn}
      itemMap={itemMap}
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
      dateFields={[...MealFields.datetimeFields, ...MealFields.dateFields]}
      excludeFields={["id"]}
      relatedFields={[]}
      optionFields={[]}
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
  const values = useMealView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={mealStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <MealRow item={item} />}
      priceFields={MealFields.pricesFields}
      {...values}
    />
  );
});

export const MealView = observer(() => {
  const { mealStore, settingStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<MealInterface, Meal>(
    settingStore,
    "Meal",
    new Meal({})
  );
  const { params, setPageDetails } = values;
  const fetchFcn = async () => {
    const resp = await mealStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(() => [] satisfies KV<any>[], []);

  const actionModalDefs = [] satisfies ActionModalDef[];

  return (
    <MyGenericView<MealInterface>
      title={title}
      Context={MealViewContext}
      CollectionComponent={MealCollection}
      FormComponent={MealForm}
      FilterComponent={MealFilter}
      actionModalDefs={actionModalDefs}
      TableComponent={MealTable}
      fetchFcn={fetchFcn}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
