import { observer } from "mobx-react-lite";
import { Category } from "../../api/CategoryStore";
import { GenericFilter } from "../../blueprints/MyFilter";

export const CategoryFilter = observer(() => {
  return (
    <GenericFilter
      view={new Category({}).$}
      title="Category Filters"
      excludeFields={["id"]}
    />
  );
});
