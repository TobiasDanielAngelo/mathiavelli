import { observer } from "mobx-react-lite";
import { Platform } from "../../api/PlatformStore";
import { GenericFilter } from "../../blueprints/MyFilter";

export const PlatformFilter = observer(() => {
  return (
    <GenericFilter
      view={new Platform({}).$}
      title="Platform Filters"
      excludeFields={["id"]}
    />
  );
});
