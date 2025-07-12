import { prop } from "mobx-keystone";
import { PropsToInterface, ViewFields } from "../constants/interfaces";
import { getStoreItem, MyModel, MyStore } from "./GenericStore";

export const AUTHENTICATOR_CHOICES = [
  "None",
  "Google Authenticator",
  "Authy",
  "Microsoft Authenticator",
  "1Password",
  "Other",
];

const slug = "personal/credentials";
const keyName = "Credential";
const props = {
  id: prop<number>(-1),
  platform: prop<number | null>(null),
  billingAccounts: prop<number[] | null>(null),
  email: prop<string>(""),
  recoveryEmail: prop<string>(""),
  associatedEmail: prop<string>(""),
  authenticatorEmail: prop<string>(""),
  profileUrl: prop<string>(""),
  pin: prop<string>(""),
  loginMethod: prop<string>(""),
  recoveryPhone: prop<string>(""),
  password: prop<string>(""),
  username: prop<string>(""),
  accountNumber: prop<string>(""),
  customAuthenticator: prop<string>(""),
  notes: prop<string>(""),
  backupCodes: prop<string>(""),
  dateCreated: prop<string>(""),
  authenticatorApp: prop<number>(0),
  addedAt: prop<string>(""),
};

const derivedProps = (item: CredentialInterface) => ({
  platformName: getStoreItem(item, "platformStore", item.platform)?.name || "—",
  billingAccountsName: item.billingAccounts?.map(
    (s) => getStoreItem(item, "accountStore", s)?.name ?? ""
  ),
  authenticatorAppName:
    AUTHENTICATOR_CHOICES.find((_, ind) => ind === item.authenticatorApp) ??
    "—",
});

export type CredentialInterface = PropsToInterface<typeof props>;
export class Credential extends MyModel(keyName, props, derivedProps) {}
export class CredentialStore extends MyStore(keyName, Credential, slug) {}
export const CredentialFields: ViewFields<CredentialInterface> = {
  datetimeFields: ["addedAt"] as const,
  dateFields: ["dateCreated"] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};
