import { observer } from "mobx-react-lite";
import EventIcon from "@mui/icons-material/Event";
import { PropsWithChildren } from "react";

export const DashboardCard = (
  props: PropsWithChildren<{
    stats: number;
    title: string;
    change?: number;
  }>
) => {
  const { stats, title, change, children } = props;

  return (
    <div
      className="flex flex-row rounded-xl shadow-md h-[100px] p-2 shrink-0 border border-gray-800 bg-gray-900"
      style={{ boxShadow: "6px 6px 12px black" }}
    >
      <div className="rounded-lg border-2 items-center my-auto p-5 mx-5 bg-gradient-to-br from-blue-900 via-blue-500 to-blue-700">
        {children}
      </div>
      <div>
        <div className="text-sm text-gray-500 font-bold">{title}</div>
        <div className="text-lg">
          <span className="font-bold">{stats.toFixed(2)}</span>
          <span className="text-md text-gray-500">
            {change ? ` (+${change?.toFixed(1)})` : ""}
          </span>
        </div>
      </div>
    </div>
  );
};
export const DashboardView = observer(() => {
  return (
    <div className="m-2">
      <div className="grid grid-cols-[repeat(auto-fit,_minmax(250px,_1fr))] gap-5 mb-3">
        {[...Array(20)].map((_, i) => (
          <DashboardCard key={i} title="Summary" stats={i} change={i}>
            <EventIcon fontSize="large" />
          </DashboardCard>
        ))}
      </div>
    </div>
  );
});
