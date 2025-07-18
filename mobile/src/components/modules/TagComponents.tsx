import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { useStore } from "../../api/Store";
import { Tag, TagFields, TagInterface } from "../../api/TagStore";
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
import { useVisible } from "../../constants/hooks";
import { Field } from "../../constants/interfaces";

export const { Context: TagViewContext, useGenericView: useTagView } =
  createGenericViewContext<TagInterface>();

const title = "Tags";

export const TagIdMap = {
  Habit: 1000001,
} as const;

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
      store={tagStore}
      datetimeFields={TagFields.datetimeFields}
      dateFields={TagFields.dateFields}
      timeFields={TagFields.timeFields}
    />
  );
};

export const TagCard = observer((props: { item: Tag }) => {
  const { item } = props;
  const { fetchFcn, shownFields, itemMap } = useTagView();
  const { tagStore } = useStore();

  return (
    <MyGenericCard
      item={item}
      shownFields={shownFields}
      header={["id"]}
      important={["name"]}
      prices={TagFields.pricesFields}
      FormComponent={TagForm}
      deleteItem={tagStore.deleteItem}
      fetchFcn={fetchFcn}
      itemMap={itemMap}
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
      dateFields={[...TagFields.datetimeFields, ...TagFields.dateFields]}
      excludeFields={["id"]}
      relatedFields={[]}
      optionFields={[]}
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
  const values = useTagView();
  const { pageDetails } = values;

  return (
    <MyGenericTable
      items={tagStore.items}
      pageIds={pageDetails?.ids ?? []}
      renderActions={(item) => <TagRow item={item} />}
      priceFields={TagFields.pricesFields}
      {...values}
    />
  );
});

export const TagView = observer(() => {
  const { tagStore, settingStore } = useStore();
  const { isVisible, setVisible } = useVisible();
  const values = useViewValues<TagInterface, Tag>(
    settingStore,
    "Tag",
    new Tag({})
  );
  const { params, setPageDetails } = values;
  const fetchFcn = async () => {
    const resp = await tagStore.fetchAll(params.toString());
    if (!resp.ok || !resp.data) {
      return;
    }
    setPageDetails(resp.pageDetails);
  };

  const itemMap = useMemo(() => [] satisfies KV<any>[], []);

  const actionModalDefs = [] satisfies ActionModalDef[];

  return (
    <MyGenericView<TagInterface>
      title={title}
      Context={TagViewContext}
      CollectionComponent={TagCollection}
      FormComponent={TagForm}
      FilterComponent={TagFilter}
      actionModalDefs={actionModalDefs}
      TableComponent={TagTable}
      fetchFcn={fetchFcn}
      isVisible={isVisible}
      setVisible={setVisible}
      itemMap={itemMap}
      {...values}
    />
  );
});
