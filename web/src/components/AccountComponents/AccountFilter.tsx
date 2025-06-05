import { observer } from "mobx-react-lite";
import { Account } from "../../api/AccountStore";
import { GenericFilter } from "../../blueprints/MyFilter";

export const AccountFilter = observer(() => {
  return (
    <GenericFilter
      view={new Account({}).$}
      title="Account Filters"
      dateFields={["datetimeAdded"]}
      excludeFields={["id"]}
    />
  );
});
