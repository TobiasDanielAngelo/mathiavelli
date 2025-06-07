import { observer } from "mobx-react-lite";
import { Credential } from "../../api/CredentialStore";
import { GenericFilter } from "../../blueprints/MyFilter";

export const CredentialFilter = observer(() => {
  return (
    <GenericFilter
      view={new Credential({}).$view}
      title="Credential Filters"
      dateFields={["dateCreated"]}
      excludeFields={["authenticatorAppName", "id"]}
      optionFields={["authenticatorApp"]}
    />
  );
});
