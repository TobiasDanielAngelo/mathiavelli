import { observer } from "mobx-react-lite";
import { BuyListItem } from "../../api/BuyListItemStore";
import { GenericFilter } from "../../blueprints/MyFilter";

export const BuyListItemFilter = observer(() => {
  return (
    <GenericFilter
      view={new BuyListItem({}).$view}
      title="Buy List Item Filters"
      dateFields={["plannedDate", "addedAt"]}
      excludeFields={["id"]}
      optionFields={["priority", "status"]}
    />
  );
});
