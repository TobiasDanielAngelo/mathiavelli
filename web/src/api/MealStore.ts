import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { MyModel, MyStore } from "./GenericStore";

export const MEAL_CATEGORY_CHOICES = ["Breakfast", "Lunch", "Dinner", "Snack"];

const slug = "health/meals/";
const keyName = "Meal";
const props = {
  id: prop<number | string>(-1),
  createdAt: prop<string>(""),
  updatedAt: prop<string>(""),
  name: prop<string>(""),
  category: prop<number>(0),
  calories: prop<number>(0),
  date: prop<string>(""),
};

export type MealInterface = PropsToInterface<typeof props>;
export class Meal extends MyModel(keyName, props) {}
export class MealStore extends MyStore(keyName, Meal, slug) {}
export const MealFields: ViewFields<MealInterface> = {
  datetimeFields: ["createdAt", "updatedAt", "date"] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
