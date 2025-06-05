import { observer } from "mobx-react-lite";
import { Transaction } from "../../api/TransactionStore";
import { GenericFilter } from "../../blueprints/MyFilter";

export const TransactionFilter = observer(() => {
  return (
    <GenericFilter
      view={new Transaction({}).$view}
      title="Transaction Filters"
      dateFields={["datetimeTransacted"]}
      relatedFields={["transmitterName", "receiverName"]}
      excludeFields={["id"]}
    />
  );
});
