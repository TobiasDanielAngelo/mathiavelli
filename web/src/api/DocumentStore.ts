import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { MyModel, MyStore } from "./GenericStore";

export const DOCUMENT_TYPE_CHOICES = [
  "ID",
  "Certificate",
  "Contract",
  "Bill",
  "Other",
];

const slug = "personal/documents/";
const keyName = "Document";
const props = {
  id: prop<number | string>(-1),
  createdAt: prop<string>(""),
  updatedAt: prop<string>(""),
  title: prop<string>(""),
  description: prop<string>(""),
  documentType: prop<number>(0),
  file: prop<File | null>(null),
  issuedDate: prop<string>(""),
  expiryDate: prop<string>(""),
  isActive: prop<boolean>(false),
};

export type DocumentInterface = PropsToInterface<typeof props>;
export class Document extends MyModel(keyName, props) {}
export class DocumentStore extends MyStore(keyName, Document, slug) {}

export const DocumentFields: ViewFields<DocumentInterface> = {
  datetimeFields: ["createdAt", "updatedAt", "createdAt", "updatedAt"] as const,
  dateFields: ["issuedDate", "expiryDate"] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
