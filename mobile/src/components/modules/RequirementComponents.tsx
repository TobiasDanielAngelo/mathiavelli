import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import {
  Requirement,
  RequirementFields,
  RequirementInterface,
} from "../../api/RequirementStore";
import { useStore } from "../../api/Store";
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
  Context: RequirementViewContext,
  useGenericView: useRequirementView,
} = createGenericViewContext<RequirementInterface>();

const title = "Requirements";

export const RequirementIdMap = {} as const;

export const RequirementForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: Partial<Requirement>;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { requirementStore, travelPlanStore } = useStore();

  const fields = useMemo(
    () =>
      [
        [
          {
            name: "plan",
            label: "Plan",
            type: "select",
            options: toOptions(travelPlanStore.items, "country"),
          },
        ],
        [{ name: "name", label: "Name", type: "text" }],
        [{ name: "cost", label: "Cost", type: "text" }],
        [{ name: "completed", label: "Completed", type: "check" }],
      ] satisfies Field[][],
    [travelPlanStore.items.length]
  );

  return (
    <MyGenericForm<RequirementInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="requirement"
      fields={fields}
      store={requirementStore}
      datetimeFields={RequirementFields.datetimeFields}
      dateFields={RequirementFields.dateFields}
      timeFields={RequirementFields.timeFields}
    />
  );
};

export const RequirementCard = observer((props: { item: Requirement }) => {
  const { item } = props;
  const { fetchFcn, shownFields, itemMap } = useRequirementView();
  const { requirementStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id"]}
      important={[]}
      prices={RequirementFields.pricesFields}
      FormComponent={RequirementForm}
      deleteItem={requirementStore.deleteItem}
      fetchFcn={fetchFcn}
      itemMap={itemMap}
    />
  );
});

export const RequirementDashboard = observer(() => {
  return <></>;
});

export const RequirementCollection = observer(() => {
  const { requirementStore } = useStore();
  const { pageDetails, PageBar } = useRequirementView();

  return (
    <SideBySideView
      SideA={
        <MyGenericCollection
          CardComponent={RequirementCard}
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={requirementStore.items}
        />
      }
      SideB={<RequirementDashboard />}
      ratio={0.7}
    />
  );
});

export const RequirementFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new Requirement({}).$view}
      title="Requirement Filters"
      dateFields={[
        ...RequirementFields.datetimeFields,
        ...RequirementFields.dateFields,
      ]}
      excludeFields={["id"]}
      relatedFields={["planName"]}
      optionFields={[]}
    />
  );
});

export const RequirementRow = observer((props: { item: Requirement }) => {
  const { item } = props;
  const { fetchFcn } = useRequirementView();
  const { requirementStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={RequirementForm}
      deleteItem={requirementStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const RequirementTable = observer(() => {
  const { requirementStore } = useStore();
  const values = useRequirementView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={requirementStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <RequirementRow item={item} />}
      priceFields={RequirementFields.pricesFields}
      {...values}
    />
  );
});

export const RequirementView = observer(() => {
  const { requirementStore, settingStore, travelPlanStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<RequirementInterface, Requirement>(
    settingStore,
    "Requirement",
    new Requirement({})
  );
  const { params, setPageDetails } = values;
  const fetchFcn = async () => {
    const resp = await requirementStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(
    () =>
      [
        {
          key: "plan",
          values: travelPlanStore.items,
          label: "country",
        },
      ] satisfies KV<any>[],
    [travelPlanStore.items.length]
  );

  const actionModalDefs = [] satisfies ActionModalDef[];

  return (
    <MyGenericView<RequirementInterface>
      title={title}
      Context={RequirementViewContext}
      CollectionComponent={RequirementCollection}
      FormComponent={RequirementForm}
      FilterComponent={RequirementFilter}
      actionModalDefs={actionModalDefs}
      TableComponent={RequirementTable}
      fetchFcn={fetchFcn}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
