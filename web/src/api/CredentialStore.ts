import {
  Model,
  _async,
  _await,
  getRoot,
  model,
  modelFlow,
  prop,
} from "mobx-keystone";
import { computed } from "mobx";
import {
  deleteItemRequest,
  fetchItemsRequest,
  postItemRequest,
  updateItemRequest,
} from "../constants/storeHelpers";
import { Store } from "./Store";
import { authenticatorApps } from "../constants/constants";

const slug = "credentials";

const props = {
  id: prop<number>(-1),
  platform: prop<number | null>(null),
  billingAccounts: prop<number[]>(() => []),
  username: prop<string>(""),
  email: prop<string>(""),
  password: prop<string>(""),
  backupCodes: prop<string>(""),
  pin: prop<string>(""),
  accountNumber: prop<string>(""),
  associatedEmail: prop<string>(""),
  recoveryEmail: prop<string>(""),
  recoveryPhone: prop<string>(""),
  loginMethod: prop<string>(""),
  dateCreated: prop<string>(""),
  profileUrl: prop<string>(""),
  authenticatorApp: prop<number>(0),
  customAuthenticator: prop<string>(""),
  authenticatorEmail: prop<string>(""),
  notes: prop<string>(""),
  addedAt: prop<string>(""),
};

export type CredentialInterface = {
  [K in keyof typeof props]?: (typeof props)[K] extends ReturnType<
    typeof prop<infer T>
  >
    ? T
    : never;
};

@model("myApp/Credential")
export class Credential extends Model(props) {
  update(details: CredentialInterface) {
    Object.assign(this, details);
  }

  get platformName() {
    const store = getRoot<Store>(this);
    return store.platformStore.allItems.get(this.platform ?? -1)?.name || "—";
  }

  get authenticatorAppName() {
    return (
      authenticatorApps.find((_, ind) => ind === this.authenticatorApp) ?? "—"
    );
  }

  get $view() {
    const store = getRoot<Store>(this);

    return {
      ...this.$,
      platformName:
        store?.platformStore?.allItems.get(this.platform ?? -1)?.name || "—",
      authenticatorAppName:
        authenticatorApps.find((_, ind) => ind === this.authenticatorApp) ??
        "—",
    };
  }
}

@model("myApp/CredentialStore")
export class CredentialStore extends Model({
  items: prop<Credential[]>(() => []),
}) {
  @computed
  get itemsSignature() {
    const keys = Object.keys(
      new Credential({}).$
    ) as (keyof CredentialInterface)[];
    return this.items
      .map((item) => keys.map((key) => String(item[key])).join("|"))
      .join("::");
  }

  @computed
  get allItems() {
    const map = new Map<number, Credential>();
    this.items.forEach((item) => map.set(item.id, item));
    return map;
  }

  @modelFlow
  fetchAll = _async(function* (this: CredentialStore, params?: string) {
    let result;

    try {
      result = yield* _await(fetchItemsRequest<Credential>(slug, params));
    } catch (error) {
      alert(error);
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      return result;
    }

    result.data.forEach((s) => {
      if (!this.items.map((s) => s.id).includes(s.id)) {
        this.items.push(new Credential(s));
      } else {
        this.items.find((t) => t.id === s.id)?.update(s);
      }
    });

    return result;
  });

  @modelFlow
  addItem = _async(function* (
    this: CredentialStore,
    details: CredentialInterface
  ) {
    let result;

    try {
      result = yield* _await(
        postItemRequest<CredentialInterface>(slug, details)
      );
    } catch (error) {
      alert(error);
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      return result;
    }

    const item = new Credential(result.data);
    this.items.push(item);

    return { details: "", ok: true, data: item };
  });

  @modelFlow
  updateItem = _async(function* (
    this: CredentialStore,
    itemId: number,
    details: CredentialInterface
  ) {
    let result;

    try {
      result = yield* _await(
        updateItemRequest<CredentialInterface>(slug, itemId, details)
      );
    } catch (error) {
      alert(error);
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      return result;
    }

    this.allItems.get(result.data.id ?? -1)?.update(result.data);

    return { details: "", ok: true, data: result.data };
  });

  @modelFlow
  deleteItem = _async(function* (this: CredentialStore, itemId: number) {
    let result;

    try {
      result = yield* _await(deleteItemRequest(slug, itemId));
    } catch (error) {
      alert(error);
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok) {
      return result;
    }

    const indexOfItem = this.items.findIndex((s) => s.id === itemId);
    if (indexOfItem !== -1) {
      this.items.splice(indexOfItem, 1);
    }

    return result;
  });
}
