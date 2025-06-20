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
import habitLogs from "/images/habit-logs.png";
import habits from "/images/habits.png";
import health from "/images/health.png";
import inventoryCategories from "/images/inventory-categories.png";
import jobs from "/images/jobs.png";
import journals from "/images/journals.png";
import meals from "/images/meals.png";
import payables from "/images/payables.png";
import personalItems from "/images/personal-items.png";
import personal from "/images/personal.png";
import platforms from "/images/platforms.png";
import productivity from "/images/productivity.png";
import receivables from "/images/receivables.png";
import schedules from "/images/schedules.png";
import tags from "/images/tags.png";
import tasks from "/images/tasks.png";
import transactions from "/images/transactions.png";
import waistMeasurements from "/images/waist-measurements.png";
import weighIns from "/images/weigh-ins.png";
import wishlist from "/images/wishlist.png";
import workouts from "/images/workouts.png";

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
  habitLogs,
  habits,
  health,
  inventoryCategories,
  jobs,
  journals,
  meals,
  payables,
  personalItems,
  personal,
  platforms,
  productivity,
  receivables,
  schedules,
  tags,
  tasks,
  transactions,
  waistMeasurements,
  weighIns,
  wishlist,
  workouts,
};

type MyImageProps = {
  image?: keyof typeof IMAGES;
};

export const MyImage = ({ image = "accounts" }: MyImageProps) => (
  <img
    src={IMAGES[image]}
    alt={image}
    onError={(e) => (e.currentTarget.src = IMAGES["accounts"])}
    className="w-full h-full object-contain"
  />
);
