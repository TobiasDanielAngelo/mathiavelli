import { observer } from "mobx-react-lite";
import { useStore } from "../../api/Store";
import { MyDynamicTable } from "../../blueprints/MyDynamicTable";
import { useBuyListItemView } from "./BuyListItemProps";
import { BuyListItemRow } from "./BuyListItemRow";

export const BuyListItemTable = observer(() => {
  const { buyListItemStore } = useStore();
  const { shownFields, params, setParams, pageDetails, itemMap, PageBar } =
    useBuyListItemView();

  return (
    <MyDynamicTable
      items={buyListItemStore.items}
      shownFields={shownFields}
      pageIds={pageDetails?.ids ?? []}
      params={params}
      setParams={setParams}
      PageBar={PageBar}
      itemMap={itemMap}
      renderActions={(item) => <BuyListItemRow item={item} />}
      priceFields={["estimatedPrice"]}
    />
  );
});
