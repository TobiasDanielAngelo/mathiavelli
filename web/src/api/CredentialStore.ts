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
} from "./_apiHelpers";
import Swal from "sweetalert2";
import { Store } from "./Store";

const slug = "personal/credentials";

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

export const AUTHENTICATOR_CHOICES = [
  "None",
  "Google Authenticator",
  "Authy",
  "Microsoft Authenticator",
  "1Password",
  "Other",
];

export type CredentialInterface = {
  [K in keyof typeof props]?: (typeof props)[K] extends ReturnType<
    typeof prop<infer T>
  >
    ? T
    : never;
};

export const CredentialFields: Record<string, (keyof CredentialInterface)[]> = {
  datetimeFields: ["addedAt"] as const,
  dateFields: ["dateCreated"] as const,
  timeFields: [] as const,
  pricesFields: [] as const,
};

@model("myApp/Credential")
export class Credential extends Model(props) {
  update(details: CredentialInterface) {
    Object.assign(this, details);
  }

  get platformName() {
    return (
      getRoot<Store>(this)?.platformStore?.allItems.get(this.platform ?? -1)
        ?.name || "—"
    );
  }
  get billingAccountsName() {
    return this.billingAccounts?.map(
      (s) => getRoot<Store>(this)?.accountStore?.allItems.get(s)?.name ?? ""
    );
  }
  get authenticatorAppName() {
    return (
      AUTHENTICATOR_CHOICES.find((_, ind) => ind === this.authenticatorApp) ??
      "—"
    );
  }

  get $view() {
    return {
      ...this.$,
      platformName:
        getRoot<Store>(this)?.platformStore?.allItems.get(this.platform ?? -1)
          ?.name || "—",
      billingAccountsName: this.billingAccounts?.map(
        (s) => getRoot<Store>(this)?.accountStore?.allItems.get(s)?.name ?? ""
      ),
      authenticatorAppName:
        AUTHENTICATOR_CHOICES.find((_, ind) => ind === this.authenticatorApp) ??
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
      new Credential({}).$view
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
      Swal.fire({
        icon: "error",
        title: "Network Error",
      });
      error;
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      Swal.fire({
        icon: "error",
        title: "An error has occurred.",
      });

      if (!result.ok || !result.data) {
        return { details: "An error has occurred", ok: false, data: null };
      }
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
      Swal.fire({
        icon: "error",
        title: "Network Error",
      });
      error;
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      Swal.fire({
        icon: "error",
        title: "An error has occurred.",
      });

      if (!result.ok || !result.data) {
        return { details: "An error has occurred", ok: false, data: null };
      }
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
      Swal.fire({
        icon: "error",
        title: "Network Error",
      });
      error;
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      Swal.fire({
        icon: "error",
        title: "An error has occurred.",
      });

      if (!result.ok || !result.data) {
        return { details: "An error has occurred", ok: false, data: null };
      }
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
      Swal.fire({
        icon: "error",
        title: "Network Error",
      });
      error;
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
