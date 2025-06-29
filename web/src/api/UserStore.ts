import { computed } from "mobx";
import { Model, _async, _await, model, modelFlow, prop } from "mobx-keystone";
import {
  deleteItemRequest,
  fetchItemsRequest,
  getCookie,
  postItemRequest,
  updateItemRequest,
} from "./_apiHelpers";
import Swal from "sweetalert2";

const slug = "users";

const props = {
  id: prop<number>(-1),
  username: prop<string>(""),
  firstName: prop<string>(""),
  lastName: prop<string>(""),
  isActive: prop<boolean>(true),
  isSuperuser: prop<boolean>(true),
};

export type UserInterface = {
  [K in keyof typeof props]?: (typeof props)[K] extends ReturnType<
    typeof prop<infer T>
  >
    ? T
    : never;
};

export interface SignupInterface extends UserInterface {
  password?: string;
  password2?: string;
}

@model("myApp/User")
export class User extends Model(props) {
  update(details: UserInterface) {
    Object.assign(this, details);
  }

  get fullName() {
    return `${this.lastName}${this.firstName || this.lastName ? "," : ""} ${
      this.firstName
    }`;
  }
}

@model("myApp/UserStore")
export class UserStore extends Model({
  items: prop<User[]>(() => []),
  currentLogger: prop<User>(() => new User({})),
}) {
  @computed
  get itemsSignature() {
    const keys = Object.keys(new User({}).$) as (keyof UserInterface)[];
    return this.items
      .map((item) => keys.map((key) => String(item[key])).join("|"))
      .join("::");
  }

  @computed
  get allItems() {
    const map = new Map<number, User>();
    this.items.forEach((item) => map.set(item.id, item));
    return map;
  }

  @modelFlow
  fetchAll = _async(function* (this: UserStore, params?: string) {
    let result;

    try {
      result = yield* _await(fetchItemsRequest<User>(slug, params));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
      });
      error;
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      return result;
    }

    result.data.forEach((s) => {
      if (!this.items.map((s) => s.id).includes(s.id)) {
        this.items.push(new User(s));
      } else {
        this.items.find((t) => t.id === s.id)?.update(s);
      }
    });

    return result;
  });

  @modelFlow
  addItem = _async(function* (this: UserStore, details: UserInterface) {
    let result;

    try {
      result = yield* _await(postItemRequest<UserInterface>(slug, details));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
      });
      error;
      return { details: "Network Error", ok: false, data: null };
    }

    if (!result.ok || !result.data) {
      return result;
    }

    const item = new User(result.data);
    this.items.push(item);

    return { details: "", ok: true, data: item };
  });

  @modelFlow
  updateItem = _async(function* (
    this: UserStore,
    itemId: number,
    details: UserInterface
  ) {
    let result;

    try {
      result = yield* _await(
        updateItemRequest<UserInterface>(slug, itemId, details)
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
      return result;
    }

    this.allItems.get(result.data.id ?? -1)?.update(result.data);

    return { details: "", ok: true, data: result.data };
  });

  @modelFlow
  deleteItem = _async(function* (this: UserStore, itemId: number) {
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

  @modelFlow
  fetchUser = _async(function* (this: UserStore, userId: string) {
    let response: Response;

    try {
      response = yield* _await(
        fetch(`${import.meta.env.VITE_BASE_URL}/${slug}/?id=${userId}`, {
          method: "GET",
          headers: {
            "Content-type": "application/json",
            "ngrok-skip-browser-warning": "any",
          },
          credentials: "include",
        })
      );
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
      });
      error;
      return { details: "Network Error", ok: false, data: null };
    }

    if (!response.ok) {
      let msg: any = yield* _await(response.json());
      if (msg.nonFieldErrors || msg.detail) {
        return {
          details: msg,
          ok: false,
          data: null,
        };
      }
      return { details: msg, ok: false, data: null };
    }

    let json: User;
    try {
      const resp = yield* _await(response.json());
      json = resp[0];
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    return { details: "", ok: true, data: json };
  });

  @modelFlow
  loginUser = _async(function* (
    this: UserStore,
    credentials: {
      username: string;
      password: string;
    }
  ) {
    let response: Response;

    try {
      response = yield* _await(
        fetch(`${import.meta.env.VITE_BASE_URL}/cookie-login`, {
          method: "POST",
          body: JSON.stringify(credentials),
          headers: {
            "Content-type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
          },
          credentials: "include",
        })
      );
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
      });
      error;
      return { details: "Network Error", ok: false, data: null };
    }

    if (!response.ok) {
      let msg: any = yield* _await(response.json());

      if (msg.nonFieldErrors || msg.detail) {
        return {
          details: msg,
          ok: false,
          data: null,
        };
      }
      return { details: msg, ok: false, data: null };
    }

    let json: User;
    try {
      const resp = yield* _await(response.json());
      json = resp.user;
      // localStorage.setItem("@userToken", resp.key);
      // localStorage.setItem("@currentUser", JSON.stringify(json));
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    this.currentLogger = new User(json);

    return { details: "", ok: true, data: "" };
  });

  @modelFlow
  logoutUser = _async(function* (this: UserStore) {
    let response: Response;

    try {
      response = yield* _await(
        fetch(`${import.meta.env.VITE_BASE_URL}/cookie-logout`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-type": "application/json",
            "ngrok-skip-browser-warning": "any",
            "X-CSRFToken": getCookie("csrftoken"),
          },
        })
      );
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
      });
      error;
      return { details: "Network Error", ok: false, data: null };
    }

    if (!response.ok) {
      let msg = yield* _await(response.json()) as any;
      if (msg.nonFieldErrors || msg.detail) {
        return {
          details: msg,
          ok: false,
          data: null,
        };
      }
      return { details: msg, ok: false, data: null };
    }

    this.currentLogger = new User({});

    return { details: "", ok: true, data: null };
  });

  @modelFlow
  reauthUser = _async(function* (this: UserStore) {
    let response: Response;

    try {
      response = yield* _await(
        fetch(`${import.meta.env.VITE_BASE_URL}/cookie-reauth`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-type": "application/json",
            "ngrok-skip-browser-warning": "any",
            "X-CSRFToken": getCookie("csrftoken"),
          },
        })
      );
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
      });
      error;
      return { details: "Network Error", ok: false, data: null };
    }

    if (!response.ok) {
      let msg = yield* _await(response.json()) as any;

      if (msg.nonFieldErrors || msg.detail) {
        return {
          details: msg,
          ok: false,
          data: null,
        };
      }
      return { details: msg, ok: false, data: null };
    }

    let json: User;
    try {
      const resp = yield* _await(response.json());
      json = resp.user;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    this.currentLogger = new User(json);

    return { details: "", ok: true, data: "" };
  });
}
