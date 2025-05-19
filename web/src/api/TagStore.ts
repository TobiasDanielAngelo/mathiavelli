import { computed } from "mobx";
import { Model, _async, _await, model, modelFlow, prop } from "mobx-keystone";

const slug = "tags";

export interface TagInterface {
  id?: number;
  name?: string;
  color?: string;
}

@model("myApp/Tag")
export class Tag extends Model({
  id: prop<number>(-1),
  name: prop<string>(""),
  color: prop<string>(""),
}) {
  update(details: TagInterface) {
    Object.assign(this, details);
  }
}

@model("myApp/TagStore")
export class TagStore extends Model({
  items: prop<Tag[]>(() => []),
}) {
  @computed
  get allItems() {
    const map = new Map<number, Tag>();
    this.items.forEach((item) => map.set(item.id, item));
    return map;
  }

  get allIDs() {
    return this.items.map((s) => s.id);
  }

  @modelFlow
  fetchAll = _async(function* (this: TagStore, params?: string) {
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

    let json: Tag[];
    try {
      const resp = yield* _await(response.json());

      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    json.forEach((s) => {
      if (!this.allIDs.includes(s.id)) {
        this.items.push(new Tag(s));
      } else {
        this.items.find((t) => t.id === s.id)?.update(s);
      }
    });

    return { details: "", ok: true, data: json };
  });

  @modelFlow
  addItem = _async(function* (this: TagStore, details: TagInterface) {
    let token: string;

    token = localStorage.getItem("@userToken") ?? "";

    let response: Response;

    try {
      response = yield* _await(
        fetch(`${import.meta.env.VITE_BASE_URL}/${slug}/`, {
          method: "POST",
          body: JSON.stringify(details),
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

    let json: Tag;
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    let item: Tag;

    item = new Tag(json);

    this.items.push(item);

    return { details: "", ok: true, data: item };
  });

  @modelFlow
  updateItem = _async(function* (
    this: TagStore,
    itemId: number,
    details: TagInterface
  ) {
    let token: string;

    token = localStorage.getItem("@userToken") ?? "";

    let response: Response;
    try {
      response = yield* _await(
        fetch(`${import.meta.env.VITE_BASE_URL}/${slug}/${itemId}/`, {
          method: "PATCH",
          body: JSON.stringify(details),
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

    let json: Tag;
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    this.allItems.get(json.id)?.update(json);

    return { details: "", ok: true, data: json };
  });

  @modelFlow
  deleteItem = _async(function* (this: TagStore, itemId: number) {
    let token: string;

    token = localStorage.getItem("@userToken") ?? "";

    let response: Response;

    try {
      response = yield* _await(
        fetch(`${import.meta.env.VITE_BASE_URL}/${slug}/${itemId}/`, {
          method: "DELETE",
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

    const indexOfItem = this.items.findIndex((s) => s.id === itemId);

    this.items.splice(indexOfItem, 1);

    return { details: "", ok: true, data: null };
  });
}

export const tagStore = new TagStore({});
