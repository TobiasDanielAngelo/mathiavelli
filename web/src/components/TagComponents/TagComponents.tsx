import { observer } from "mobx-react-lite";
import { Tag, TagFields } from "../../api/TagStore";
import { useStore } from "../../api/Store";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { sortAndFilterByIds } from "../../constants/helpers";
import { Field } from "../../constants/interfaces";
import { MyGenericCard } from "../../blueprints/MyGenericComponents/MyGenericCard";
import { MyGenericFilter } from "../../blueprints/MyGenericComponents/MyGenericFilter";
import { MyGenericForm } from "../../blueprints/MyGenericComponents/MyGenericForm";
import { MyGenericRow } from "../../blueprints/MyGenericComponents/MyGenericRow";
import { MyGenericTable } from "../../blueprints/MyGenericComponents/MyGenericTable";
import { TagInterface } from "../../api/TagStore";
import { createGenericViewContext } from "../../blueprints/MyGenericComponents/MyGenericProps";
import { useMemo } from "react";

export const { Context: TagViewContext, useGenericView: useTagView } =
  createGenericViewContext<TagInterface>();

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
        <div className="flex flex-col min-h-[85vh]">
          <PageBar />
          <div className="flex-1">
            {sortAndFilterByIds(
              tagStore.items,
              pageDetails?.ids ?? [],
              (s) => s.id
            ).map((s) => (
              <TagCard item={s} key={s.id} />
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

export const TagFilter = observer(() => {
  return (
    <MyGenericFilter
      view={new Tag({}).$}
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
  const { shownFields, params, setParams, pageDetails, PageBar } = useTagView();

  return (
    <MyGenericTable
      items={tagStore.items}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      renderActions={(item) => <TagRow item={item} />}
      priceFields={TagFields.prices}
    />
  );
});
