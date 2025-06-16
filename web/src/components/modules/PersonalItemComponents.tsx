import { observer } from "mobx-react-lite";
import {
  PersonalItem,
  PersonalItemFields,
  PersonalItemInterface,
} from "../../api/PersonalItemStore";
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

export const {
  Context: PersonalItemViewContext,
  useGenericView: usePersonalItemView,
} = createGenericViewContext<PersonalItemInterface>();

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
        [{ name: "worth", label: "Worth", type: "text" }],
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
      storeFns={{
        add: personalItemStore.addItem,
        update: personalItemStore.updateItem,
        delete: personalItemStore.deleteItem,
      }}
      datetimeFields={PersonalItemFields.datetime}
      dateFields={PersonalItemFields.date}
    />
  );
};

export const PersonalItemCard = observer((props: { item: PersonalItem }) => {
  const { item } = props;
  const { fetchFcn, shownFields } = usePersonalItemView();
  const { personalItemStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id"]}
      important={["name"]}
      prices={PersonalItemFields.prices}
      FormComponent={PersonalItemForm}
      deleteItem={personalItemStore.deleteItem}
      fetchFcn={fetchFcn}
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
        <div className="flex flex-col min-h-[85vh]">
          <PageBar />
          <div className="flex-1">
            {sortAndFilterByIds(
              personalItemStore.items,
              pageDetails?.ids ?? [],
              (s) => s.id
            ).map((s) => (
              <PersonalItemCard item={s} key={s.id} />
            ))}
          </div>
          <PageBar />
        </div>
      }
      SideB={<PersonalItemDashboard />}
      ratio={0.7}
    />
  );
});

export const PersonalItemFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new PersonalItem({}).$}
      title="PersonalItem Filters"
      dateFields={PersonalItemFields.datetime}
      excludeFields={["id"]}
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
  const { shownFields, params, setParams, pageDetails, PageBar, itemMap } =
    usePersonalItemView();

  return (
    <MyGenericTable
      items={personalItemStore.items}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <PersonalItemRow item={item} />}
      priceFields={PersonalItemFields.prices}
      itemMap={itemMap}
    />
  );
});

export const PersonalItemView = observer(() => {
  const { personalItemStore } = useStore();
  const { setVisible1, isVisible, setVisible } = useVisible();
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const [params, setParams] = useSearchParams();
  const objWithFields = new PersonalItem({}).$;
  const [shownFields, setShownFields] = useLocalStorageState(
    Object.keys(objWithFields) as (keyof PersonalItemInterface)[],
    "shownFieldsPersonalItem"
  );
  const fetchFcn = async () => {
    const resp = await personalItemStore.fetchAll(params.toString());
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
      name: "Add a PersonalItem",
      modal: <PersonalItemForm fetchFcn={fetchFcn} setVisible={setVisible1} />,
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
            setShownFields(t as (keyof PersonalItemInterface)[])
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
      modal: <PersonalItemFilter />,
    },
  ] satisfies ActionModalDef[];

  return (
    <MyGenericView<PersonalItemInterface>
      fetchFcn={fetchFcn}
      actionModalDefs={actionModalDefs}
      isVisible={isVisible}
      setVisible={setVisible}
      Context={PersonalItemViewContext}
      CollectionComponent={PersonalItemCollection}
      TableComponent={PersonalItemTable}
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
