import { observer } from "mobx-react-lite";
import { FollowUp } from "../../api/FollowUpStore";
import { GenericFilter } from "../../blueprints/MyFilter";

export const FollowUpFilter = observer(() => {
  return (
    <GenericFilter
      view={new FollowUp({}).$view}
      title="Follow Up Filters"
      dateFields={["date"]}
      relatedFields={[]}
      excludeFields={["id"]}
      optionFields={["status"]}
    />
  );
});
