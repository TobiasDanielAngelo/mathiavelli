import { observer } from "mobx-react-lite";
import { useStore } from "../../api/Store";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { CredentialCard } from "./CredentialCard";
import { useCredentialView } from "./CredentialProps";

export const CredentialCollection = observer(() => {
  const { credentialStore } = useStore();
  const { shownFields, pageDetails, PageBar } = useCredentialView();

  return (
    <SideBySideView
      SideA={
        <div className="flex flex-col min-h-[85vh]">
          <PageBar />
          <div className="flex-1">
            {credentialStore.items
              .filter((s) => pageDetails?.ids?.includes(s.id))
              .sort((a, b) => {
                return (
                  (pageDetails?.ids?.indexOf(a.id) ?? 0) -
                  (pageDetails?.ids?.indexOf(b.id) ?? 0)
                );
              })
              .map((s) => (
                <CredentialCard item={s} key={s.id} shownFields={shownFields} />
              ))}
          </div>
          <PageBar />
        </div>
      }
      SideB=""
      ratio={0.7}
    />
  );
});
