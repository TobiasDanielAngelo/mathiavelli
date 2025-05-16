import { computed } from "mobx";
import { Model, _async, _await, model, modelFlow, prop } from "mobx-keystone";

const slug = "users";

export interface UserInterface {
  id?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  isSuperuser?: boolean;
}

export interface SignupInterface extends UserInterface {
  password?: string;
  password2?: string;
}

@model("myApp/User")
export class User extends Model({
  id: prop<number>(-1),
  username: prop<string>(""),
  firstName: prop<string>(""),
  lastName: prop<string>(""),
  isActive: prop<boolean>(true),
  isSuperuser: prop<boolean>(true),
}) {
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
  get allItems() {
    const map = new Map<number, User>();
    this.items.forEach((item) => map.set(item.id, item));
    return map;
  }

  get allIDs() {
    return this.items.map((s) => s.id);
  }

  @modelFlow
  fetchAll = _async(function* (this: UserStore, params?: string) {
    let token: string;

    token = localStorage.getItem("@userToken") ?? "";

    let response: Response;

    try {
      response = yield* _await(
        fetch(
          `${import.meta.env.VITE_BASE_URL}/${slug}/${params ? params : ""}`,
          {
            method: "GET",
            headers: {
              "Content-type": "application/json",
              Authorization: `Token ${token}`,
              "ngrok-skip-browser-warning": "any",
            },
          }
        )
      );
    } catch (error) {
      alert(error);
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

    let json: User[];
    try {
      const resp = yield* _await(response.json());

      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    json.forEach((s) => {
      if (!this.allIDs.includes(s.id)) {
        this.items.push(new User(s));
      } else {
        this.items.find((t) => t.id === s.id)?.update(s);
      }
    });

    return { details: "", ok: true, data: json };
  });

  @modelFlow
  fetchUser = _async(function* (this: UserStore, userId: string) {
    let token: string;

    token = localStorage.getItem("@userToken") ?? "";

    let response: Response;

    try {
      response = yield* _await(
        fetch(`${import.meta.env.VITE_BASE_URL}/${slug}/?id=${userId}`, {
          method: "GET",
          headers: {
            "Content-type": "application/json",
            Authorization: `Token ${token}`,
            "ngrok-skip-browser-warning": "any",
          },
        })
      );
    } catch (error) {
      alert(error);
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
        fetch(`${import.meta.env.VITE_BASE_URL}/login`, {
          method: "POST",
          body: JSON.stringify(credentials),
          headers: {
            "Content-type": "application/json",
          },
        })
      );
    } catch (error) {
      alert(error);
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
      localStorage.setItem("@userToken", resp.key);
      localStorage.setItem("@currentUser", JSON.stringify(json));
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    this.currentLogger = new User(json);

    return { details: "", ok: true, data: "" };
  });

  @modelFlow
  logoutUser = _async(function* (this: UserStore) {
    let token: string;

    token = localStorage.getItem("@userToken") ?? "";

    let response: Response;

    try {
      response = yield* _await(
        fetch(`${import.meta.env.VITE_BASE_URL}/logout`, {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            Authorization: `Token ${token}`,
            "ngrok-skip-browser-warning": "any",
          },
        })
      );
    } catch (error) {
      alert(error);
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

    localStorage.removeItem("@userToken");
    localStorage.removeItem("@currentUser");

    return { details: "", ok: true, data: null };
  });

  @modelFlow
  reauthUser = _async(function* (this: UserStore) {
    let token: string;

    token = localStorage.getItem("@userToken") ?? "";

    if (token === "") {
      return { details: `No token available.`, ok: false, data: null };
    }

    let response: Response;

    try {
      response = yield* _await(
        fetch(`${import.meta.env.VITE_BASE_URL}/reauth`, {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            Authorization: `Token ${token}`,
            "ngrok-skip-browser-warning": "any",
          },
        })
      );
    } catch (error) {
      alert(error);
      return { details: "Network Error", ok: false, data: null };
    }

    if (!response.ok) {
      localStorage.clear();

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

  @modelFlow
  addItem = _async(function* (this: UserStore, details: SignupInterface) {
    let data = new FormData();

    for (let x in Object.keys(details)) {
      if (
        Object.keys(details)[x] !== "avatar" &&
        !!details[Object.keys(details)[x] as keyof typeof details]
      ) {
        data.append(
          Object.keys(details)[x],
          `${details[Object.keys(details)[x] as keyof typeof details]}`
        );
      }
    }

    let response: Response;

    try {
      response = yield* _await(
        fetch(`${import.meta.env.VITE_BASE_URL}/signup`, {
          method: "POST",
          body: data,
        })
      );
    } catch (error) {
      alert(error);
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
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    let item: User;

    item = new User(json);

    this.items.push(item);

    return { details: "", ok: true, data: item };
  });

  @modelFlow
  updateItem = _async(function* (
    this: UserStore,
    itemId: number,
    details: UserInterface
  ) {
    let data = new FormData();

    for (let x in Object.keys(details)) {
      if (Object.keys(details)[x] !== "avatar") {
        data.append(
          Object.keys(details)[x],
          `${details[Object.keys(details)[x] as keyof typeof details]}`
        );
      }
    }

    let token: string;

    token = localStorage.getItem("@userToken") ?? "";

    let response: Response;

    try {
      response = yield* _await(
        fetch(`${import.meta.env.VITE_BASE_URL}/${slug}/${itemId}/`, {
          method: "PATCH",
          body: data,
          headers: {
            Authorization: `Token ${token}`,
            "ngrok-skip-browser-warning": "any",
          },
        })
      );
    } catch (error) {
      alert(error);
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
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    this.allItems.get(json.id)?.update(json);
    if (this.currentLogger.id === json.id) this.currentLogger = json;

    return { details: "", ok: true, data: json };
  });
}

export const userStore = new UserStore({});
