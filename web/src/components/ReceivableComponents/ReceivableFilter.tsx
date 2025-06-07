import { observer } from "mobx-react-lite";
import { Receivable } from "../../api/ReceivableStore";
import { GenericFilter } from "../../blueprints/MyFilter";

export const ReceivableFilter = observer(() => {
  return (
    <GenericFilter
      view={new Receivable({}).$view}
      title="Receivable Filters"
      dateFields={["datetimeClosed", "datetimeDue", "datetimeOpened"]}
      relatedFields={["paymentDescription"]}
      excludeFields={["id"]}
    />
  );
});
