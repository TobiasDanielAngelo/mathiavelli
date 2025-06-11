import { observer } from "mobx-react-lite";
import { Job } from "../../api/JobStore";
import { GenericFilter } from "../../blueprints/MyFilter";

export const JobFilter = observer(() => {
  return (
    <GenericFilter
      view={new Job({}).$view}
      title="Job Filters"
      dateFields={["createdAt", "deadline", "updatedAt", "appliedDate"]}
      relatedFields={[]}
      excludeFields={["id"]}
      optionFields={["status", "source", "jobType", "workSetup"]}
    />
  );
});
