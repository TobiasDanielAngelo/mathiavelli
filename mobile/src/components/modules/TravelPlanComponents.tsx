import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { useStore } from "../../api/Store";
import {
  PURPOSE_CHOICES,
  STATUS_CHOICES,
  TravelPlan,
  TravelPlanFields,
  TravelPlanInterface,
} from "../../api/TravelPlanStore";
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
  Context: TravelPlanViewContext,
  useGenericView: useTravelPlanView,
} = createGenericViewContext<TravelPlanInterface>();

const title = "Travel Plans";

export const TravelPlanIdMap = {} as const;

export const TravelPlanForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: Partial<TravelPlan>;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { travelPlanStore } = useStore();

  const fields = useMemo(
    () =>
      [
        [{ name: "itemsToBring", label: "Items To Bring", type: "multi" }],
        [{ name: "country", label: "Country", type: "text" }],
        [{ name: "city", label: "City", type: "text" }],
        [
          {
            name: "purpose",
            label: "Purpose",
            type: "select",
            options: toOptions(PURPOSE_CHOICES),
          },
        ],
        [{ name: "targetDate", label: "Target Date", type: "date" }],
        [
          {
            name: "status",
            label: "Status",
            type: "select",
            options: toOptions(STATUS_CHOICES),
          },
        ],
        [{ name: "notes", label: "Notes", type: "textarea" }],
      ] satisfies Field[][],
    []
  );

  return (
    <MyGenericForm<TravelPlanInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="travelPlan"
      fields={fields}
      store={travelPlanStore}
      datetimeFields={TravelPlanFields.datetimeFields}
      dateFields={TravelPlanFields.dateFields}
      timeFields={TravelPlanFields.timeFields}
    />
  );
};

export const TravelPlanCard = observer((props: { item: TravelPlan }) => {
  const { item } = props;
  const { fetchFcn, shownFields, itemMap } = useTravelPlanView();
  const { travelPlanStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id"]}
      important={[]}
      prices={TravelPlanFields.pricesFields}
      FormComponent={TravelPlanForm}
      deleteItem={travelPlanStore.deleteItem}
      fetchFcn={fetchFcn}
      itemMap={itemMap}
    />
  );
});

export const TravelPlanDashboard = observer(() => {
  return <></>;
});

export const TravelPlanCollection = observer(() => {
  const { travelPlanStore } = useStore();
  const { pageDetails, PageBar } = useTravelPlanView();

  return (
    <SideBySideView
      SideA={
        <MyGenericCollection
          CardComponent={TravelPlanCard}
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={travelPlanStore.items}
        />
      }
      SideB={<TravelPlanDashboard />}
      ratio={0.7}
    />
  );
});

export const TravelPlanFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new TravelPlan({}).$view}
      title="Travel Plan Filters"
      dateFields={[
        ...TravelPlanFields.datetimeFields,
        ...TravelPlanFields.dateFields,
      ]}
      excludeFields={["id"]}
      relatedFields={["itemsToBringName", "purposeName", "statusName"]}
      optionFields={[]}
    />
  );
});

export const TravelPlanRow = observer((props: { item: TravelPlan }) => {
  const { item } = props;
  const { fetchFcn } = useTravelPlanView();
  const { travelPlanStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={TravelPlanForm}
      deleteItem={travelPlanStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const TravelPlanTable = observer(() => {
  const { travelPlanStore } = useStore();
  const values = useTravelPlanView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={travelPlanStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <TravelPlanRow item={item} />}
      priceFields={TravelPlanFields.pricesFields}
      {...values}
    />
  );
});

export const TravelPlanView = observer(() => {
  const { travelPlanStore, settingStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<TravelPlanInterface, TravelPlan>(
    settingStore,
    "TravelPlan",
    new TravelPlan({})
  );
  const { params, setPageDetails } = values;
  const fetchFcn = async () => {
    const resp = await travelPlanStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(
    () =>
      [
        { key: "purpose", label: "", values: PURPOSE_CHOICES },
        { key: "status", label: "", values: STATUS_CHOICES },
      ] satisfies KV<any>[],
    []
  );

  const actionModalDefs = [] satisfies ActionModalDef[];

  return (
    <MyGenericView<TravelPlanInterface>
      title={title}
      Context={TravelPlanViewContext}
      CollectionComponent={TravelPlanCollection}
      FormComponent={TravelPlanForm}
      FilterComponent={TravelPlanFilter}
      actionModalDefs={actionModalDefs}
      TableComponent={TravelPlanTable}
      fetchFcn={fetchFcn}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
