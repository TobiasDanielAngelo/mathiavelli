import { observer } from "mobx-react-lite";
import { Task } from "../../api/TaskStore";
import { GenericFilter } from "../../blueprints/MyFilter";

export const TaskFilter = observer(() => {
  return (
    <GenericFilter
      view={new Task({}).$view}
      title="Task Filters"
      dateFields={[
        "dateCompleted",
        "dateCreated",
        "dateEnd",
        "dateStart",
        "dueDate",
      ]}
      relatedFields={["goalTitle"]}
      excludeFields={["repeatName", "dateDuration", "id"]}
      optionFields={["repeat"]}
    />
  );
});
