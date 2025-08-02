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

const slug = "health/workouts/";
const keyName = "Workout";
const props = {
  id: prop<number | string>(-1),
  createdAt: prop<string>(""),
  updatedAt: prop<string>(""),
  name: prop<string>(""),
  category: prop<number>(0),
  durationMinutes: prop<number>(0),
  caloriesBurned: prop<number>(0),
  date: prop<string>(""),
};

export type WorkoutInterface = PropsToInterface<typeof props>;
export class Workout extends MyModel(keyName, props) {}
export class WorkoutStore extends MyStore(keyName, Workout, slug) {}
export const WorkoutFields: ViewFields<WorkoutInterface> = {
  datetimeFields: ["createdAt", "updatedAt", "date"] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
