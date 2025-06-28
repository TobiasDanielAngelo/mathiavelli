import accounts from "/images/accounts.png";
import bodyFats from "/images/body-fats.png";
import career from "/images/career.png";
import categories from "/images/categories.png";
import credentials from "/images/credentials.png";
import events from "/images/events.png";
import finance from "/images/finance.png";
import followUps from "/images/follow-ups.png";
import goals from "/images/goals.png";
import back from "/images/back.png";
import logs from "/images/logs.png";
import habits from "/images/habits.png";
import health from "/images/health.png";
import inventoryTypes from "/images/inventory-types.png";
import jobs from "/images/jobs.png";
import journals from "/images/journals.png";
import meals from "/images/meals.png";
import payables from "/images/payables.png";
import inventory from "/images/inventory.png";
import personal from "/images/personal.png";
import platforms from "/images/platforms.png";
import productivity from "/images/productivity.png";
import receivables from "/images/receivables.png";
import schedules from "/images/schedules.png";
import tags from "/images/tags.png";
import tasks from "/images/tasks.png";
import transactions from "/images/transactions.png";
import waistMeasure from "/images/waist-measure.png";
import weighIns from "/images/weigh-ins.png";
import wishlist from "/images/wishlist.png";
import workouts from "/images/workouts.png";
import settings from "/images/settings.png";
import { useState } from "react";
import { MyIcon } from "./MyIcon";

const IMAGES: Record<string, string> = {
  accounts,
  bodyFats,
  career,
  categories,
  credentials,
  events,
  finance,
  followUps,
  back,
  goals,
  logs,
  habits,
  health,
  inventoryTypes,
  jobs,
  journals,
  meals,
  payables,
  inventory,
  personal,
  platforms,
  productivity,
  receivables,
  schedules,
  tags,
  tasks,
  transactions,
  waistMeasure,
  weighIns,
  wishlist,
  settings,
  workouts,
};

type MyImageProps = {
  image?: keyof typeof IMAGES;
};

export const MyImage = ({ image = "accounts" }: MyImageProps) => {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <img
        src={IMAGES[image]}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          console.error("Image failed to load.");
        }}
        className="w-full h-full object-contain"
      />
      {loading ? <MyIcon icon="RestartAlt" style={{ fontSize: 48 }} /> : <></>}
    </>
  );
};
