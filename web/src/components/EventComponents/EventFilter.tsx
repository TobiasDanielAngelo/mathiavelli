import { observer } from "mobx-react-lite";
import { Event } from "../../api/EventStore";
import { GenericFilter } from "../../blueprints/MyFilter";

export const EventFilter = observer(() => {
  return (
    <GenericFilter
      view={new Event({}).$view}
      title="Event Filters"
      dateFields={["createdAt", "start", "end"]}
      relatedFields={["tagNames"]}
      excludeFields={["tags", "id", "dateDuration"]}
    />
  );
});
