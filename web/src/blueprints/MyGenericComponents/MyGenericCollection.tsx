import { observer } from "mobx-react-lite";
import { SideBySideView } from "../SideBySideView";

export const MyGenericCollection = observer(() => {
  return (
    <SideBySideView
      SideA={
        <div className="flex flex-col min-h-[85vh]">
          <div className="flex-1"></div>
        </div>
      }
      SideB=""
      ratio={0.7}
    />
  );
});
