import { observer } from "mobx-react-lite";
import { Goal } from "../../api/GoalStore";
import { GenericFilter } from "../../blueprints/MyFilter";

export const GoalFilter = observer(() => {
  return (
    <GenericFilter
      view={new Goal({}).$view}
      title="Goal Filters"
      dateFields={["dateCompleted", "dateCreated", "dateEnd", "dateStart"]}
      relatedFields={["parentGoalTitle"]}
      excludeFields={["id"]}
    />
  );
});
