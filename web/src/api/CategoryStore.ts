import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { MyModel, MyStore } from "./GenericStore";

export const CATEGORY_CHOICES = [
  "Expense",
  "Income",
  "Transfer",
  "Payable",
  "Receivable",
];

const slug = "finance/categories/";
const keyName = "Category";
const props = {
  id: prop<number | string>(-1),
  title: prop<string>(""),
  nature: prop<number>(0),
  logo: prop<string>(""),
};

export type CategoryInterface = PropsToInterface<typeof props>;
export class Category extends MyModel(keyName, props) {}
export class CategoryStore extends MyStore(keyName, Category, slug) {}
export const CategoryFields: ViewFields<CategoryInterface> = {
  datetimeFields: [] as const,
  dateFields: [] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
