import { observer } from "mobx-react-lite";
import { Payable } from "../../api/PayableStore";
import { GenericFilter } from "../../blueprints/MyFilter";

export const PayableFilter = observer(() => {
  return (
    <GenericFilter
      view={new Payable({}).$view}
      title="Payable Filters"
      dateFields={["datetimeClosed", "datetimeDue", "datetimeOpened"]}
      relatedFields={["paymentDescription"]}
      excludeFields={["id"]}
    />
  );
});
