import { observer } from "mobx-react-lite";
import { useStore } from "../../api/Store";
import { SideBySideView } from "../../blueprints/SideBySideView";
import { GoalCard } from "./GoalCard";
import { useGoalView } from "./GoalProps";

export const GoalCollection = observer(() => {
  const { goalStore } = useStore();
  const { shownFields, pageDetails, PageBar } = useGoalView();

  return (
    <SideBySideView
      SideB={
        <div className="flex flex-col min-h-[85vh]">
          <PageBar />
          <div className="flex-1">
            {goalStore.items
              .filter(
                (s) => s.parentGoal == null && pageDetails?.ids?.includes(s.id)
              )
              .sort((a, b) => {
                return (
                  (pageDetails?.ids?.indexOf(a.id) ?? 0) -
                  (pageDetails?.ids?.indexOf(b.id) ?? 0)
                );
              })
              .map((s) => (
                <GoalCard
                  item={s}
                  key={s.id}
                  shownFields={shownFields}
                  border
                />
              ))}
          </div>
          <PageBar />
        </div>
      }
      SideA=""
      ratio={0.7}
    />
  );
});
