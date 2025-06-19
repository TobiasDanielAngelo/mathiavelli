import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useStore } from "../../api/Store";
import { Tag, TagFields, TagInterface } from "../../api/TagStore";
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
import { toTitleCase } from "../../constants/helpers";
import { useLocalStorageState, useVisible } from "../../constants/hooks";
import { Field, PaginatedDetails } from "../../constants/interfaces";

export const { Context: TagViewContext, useGenericView: useTagView } =
  createGenericViewContext<TagInterface>();

const title = "Tags";

export const TagIdMap = {} as const;

export const TagForm = ({
  item,
  setVisible,
  fetchFcn,
}: {
  item?: Tag;
  setVisible?: (t: boolean) => void;
  fetchFcn?: () => void;
}) => {
  const { tagStore } = useStore();

  const fields = useMemo(
    () =>
      [
        [
          {
            name: "name",
            label: "Tag Name",
            type: "text",
          },
        ],
        [
          {
            name: "color",
            label: "Color",
            type: "color",
          },
        ],
      ] satisfies Field[][],
    []
  );

  return (
    <MyGenericForm<TagInterface>
      item={item?.$ ?? item}
      setVisible={setVisible}
      fetchFcn={fetchFcn}
      objectName="tag"
      fields={fields}
      storeFns={{
        add: tagStore.addItem,
        update: tagStore.updateItem,
        delete: tagStore.deleteItem,
      }}
      datetimeFields={TagFields.datetime}
      dateFields={TagFields.date}
    />
  );
};

export const TagCard = observer((props: { item: Tag }) => {
  const { item } = props;
  const { fetchFcn, shownFields } = useTagView();
  const { tagStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id"]}
      important={["name"]}
      prices={TagFields.prices}
      FormComponent={TagForm}
      deleteItem={tagStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const TagCollection = observer(() => {
  const { tagStore } = useStore();
  const { pageDetails, PageBar } = useTagView();

  return (
    <SideBySideView
      SideA={
        <MyGenericCollection
          CardComponent={TagCard}
          title={title}
          pageDetails={pageDetails}
          PageBar={PageBar}
          items={tagStore.items}
        />
      }
      SideB=""
      ratio={0.7}
    />
  );
});

export const TagFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new Tag({}).$view}
      title="Tag Filters"
      dateFields={TagFields.datetime}
      excludeFields={["id"]}
    />
  );
});

export const TagRow = observer((props: { item: Tag }) => {
  const { item } = props;
  const { fetchFcn } = useTagView();
  const { tagStore } = useStore();

  return (
    <MyGenericRow
      item={item}
      FormComponent={TagForm}
      deleteItem={tagStore.deleteItem}
      fetchFcn={fetchFcn}
    />
  );
});

export const TagTable = observer(() => {
  const { tagStore } = useStore();
  const {
    shownFields,
    params,
    setParams,
    pageDetails,
    PageBar,
    itemMap,
    sortFields,
    setSortFields,
  } = useTagView();

  return (
    <MyGenericTable
      items={tagStore.items}
      shownFields={shownFields}
      sortFields={sortFields}
      setSortFields={setSortFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <TagRow item={item} />}
      priceFields={TagFields.prices}
      itemMap={itemMap}
    />
  );
});

export const TagView = observer(() => {
  const { tagStore } = useStore();
  const { setVisible1, isVisible, setVisible } = useVisible();
  const [pageDetails, setPageDetails] = useState<
    PaginatedDetails | undefined
  >();
  const [params, setParams] = useSearchParams();
  const objWithFields = new Tag({}).$;
  const [shownFields, setShownFields] = useLocalStorageState(
    Object.keys(objWithFields) as (keyof TagInterface)[],
    "shownFieldsTag"
  );
  const [sortFields, setSortFields] = useLocalStorageState(
    [] as string[],
    "sortFieldsTag"
  );
  const fetchFcn = async () => {
    const resp = await tagStore.fetchAll(params.toString());
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
      name: "Add a Tag",
      modal: <TagForm fetchFcn={fetchFcn} setVisible={setVisible1} />,
    },
    {
      icon: "ViewList",
      label: "FIELDS",
      name: "Show Fields",
      modal: (
        <MyMultiDropdownSelector
          label="Fields"
          value={shownFields}
          onChangeValue={(t) => setShownFields(t as (keyof TagInterface)[])}
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
      modal: <TagFilter />,
    },
  ] satisfies ActionModalDef[];

  return (
    <MyGenericView<TagInterface>
      title={title}
      fetchFcn={fetchFcn}
      actionModalDefs={actionModalDefs}
      isVisible={isVisible}
      setVisible={setVisible}
      Context={TagViewContext}
      CollectionComponent={TagCollection}
      TableComponent={TagTable}
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
