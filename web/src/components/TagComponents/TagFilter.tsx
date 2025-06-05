import { observer } from "mobx-react-lite";
import { Tag } from "../../api/TagStore";
import { GenericFilter } from "../../blueprints/MyFilter";

export const TagFilter = observer(() => {
  return (
    <GenericFilter
      view={new Tag({}).$}
      title="Tag Filters"
      excludeFields={["id"]}
    />
  );
});
