import { observer } from "mobx-react-lite";
import { Journal } from "../../api/JournalStore";
import { GenericFilter } from "../../blueprints/MyFilter";

export const JournalFilter = observer(() => {
  return (
    <GenericFilter
      view={new Journal({}).$}
      title="Journal Filters"
      dateFields={["datetimeCreated"]}
      excludeFields={["id"]}
    />
  );
});
