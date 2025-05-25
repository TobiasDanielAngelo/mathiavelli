import { observer } from "mobx-react-lite";
import { SideBySideView } from "../blueprints/SideBySideView";

export const HealthView = observer(() => {
  return <SideBySideView SideA={""} SideB={""} ratio={0.7} />;
});
