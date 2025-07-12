import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { MyModel, MyStore } from "./GenericStore";

export const WORKOUT_CATEGORY_CHOICES = [
  "Cardio",
  "Upper Body",
  "Lower Body",
  "Core",
  "Full Body",
  "Other",
];

const slug = "health/workouts";
const keyName = "Workout";
const props = {
  id: prop<number>(-1),
  name: prop<string>(""),
  category: prop<number>(0),
  durationMinutes: prop<number>(0),
  caloriesBurned: prop<number>(0),
  date: prop<string>(""),
};

const derivedProps = (item: WorkoutInterface) => ({
  categoryName:
    WORKOUT_CATEGORY_CHOICES.find((_, ind) => ind === item.category) ?? "—",
});

export type WorkoutInterface = PropsToInterface<typeof props>;
export class Workout extends MyModel(keyName, props, derivedProps) {}
export class WorkoutStore extends MyStore(keyName, Workout, slug) {}
export const WorkoutFields: ViewFields<WorkoutInterface> = {
  datetimeFields: ["date"] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
