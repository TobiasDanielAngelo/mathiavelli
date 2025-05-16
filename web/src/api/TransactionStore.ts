import {
  Model,
  _async,
  _await,
  model,
  modelAction,
  modelFlow,
  prop,
} from "mobx-keystone";

const slug = "transactions";

export interface TransactionInterface {
  id?: number;
  category?: number;
  description?: string;
  transmitter?: number;
  receiver?: number;
  amount?: number;
  datetimeTransacted?: string;
}

@model("myApp/Transaction")
export class Transaction extends Model({
  id: prop<number>(-1),
  category: prop<number>(-1),
  description: prop<string>(""),
  transmitter: prop<number>(-1),
  receiver: prop<number>(-1),
  amount: prop<number>(0),
  datetimeTransacted: prop<string>(""),
}) {
  update(details: TransactionInterface) {
    Object.assign(this, details);
  }
}

@model("myApp/TransactionStore")
export class TransactionStore extends Model({
  items: prop<Transaction[]>(() => []),
}) {
  get allIDs() {
    return this.items.map((s) => s.id);
  }

  @modelAction
  getItem(id: number) {
    return this.items.find((s) => s.id === id) ?? new Transaction({});
  }

  @modelFlow
  fetchAll = _async(function* (this: TransactionStore, params?: string) {
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

    let json: Transaction[];
    try {
      const resp = yield* _await(response.json());

      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    json.forEach((s) => {
      if (!this.allIDs.includes(s.id)) {
        this.items.push(new Transaction(s));
      } else {
        this.items.find((t) => t.id === s.id)?.update(s);
      }
    });

    return { details: "", ok: true, data: json };
  });

  @modelFlow
  addItem = _async(function* (
    this: TransactionStore,
    details: TransactionInterface
  ) {
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

    let json: Transaction;
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    let item: Transaction;

    item = new Transaction(json);

    this.items.push(item);

    return { details: "", ok: true, data: item };
  });

  @modelFlow
  updateItem = _async(function* (
    this: TransactionStore,
    itemId: number,
    details: TransactionInterface
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

    let json: Transaction;
    try {
      const resp = yield* _await(response.json());
      json = resp;
    } catch (error) {
      console.error("Parsing Error", error);
      return { details: "Parsing Error", ok: false, data: null };
    }

    this.getItem(json.id)?.update(json);

    return { details: "", ok: true, data: json };
  });

  @modelFlow
  deleteItem = _async(function* (this: TransactionStore, itemId: number) {
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

export const transactionStore = new TransactionStore({});
