import { PaginatedResponse } from "./interfaces";

const getToken = () => localStorage.getItem("@userToken") ?? "";

async function request<T>(
  endpoint: string,
  options: {
    method: "GET" | "POST" | "PATCH" | "DELETE";
    body?: any;
    itemId?: number;
    params?: string;
  }
): Promise<{ details: any; ok: boolean; data: T | null }> {
  const token = getToken();

  const input = new URLSearchParams(options.params);
  const filtered = new URLSearchParams();

  for (const [key, value] of input.entries()) {
    if (value.trim()) filtered.append(key, value);
  }

  let url = `${import.meta.env.VITE_BASE_URL}/${endpoint}/`;
  if (options.itemId) url += `${options.itemId}/`;
  if (options.params) url += `?${filtered.toString()}`;

  const headers: Record<string, string> = {
    "Content-type": "application/json",
    Authorization: `Token ${token}`,
    "ngrok-skip-browser-warning": "any",
  };

  const response = await fetch(url, {
    method: options.method,
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers,
  });

  if (!response.ok) {
    const msg = await response.json();
    return { details: msg, ok: false, data: null };
  }

  try {
    if (options.method === "DELETE") {
      return { details: "", ok: true, data: null };
    }

    const json: T = await response.json();
    return { details: "", ok: true, data: json };
  } catch (error) {
    console.error("Parsing Error", error);
    return { details: "Parsing Error", ok: false, data: null };
  }
}

export async function fetchItemsRequest<T>(
  endpoint: string,
  params?: string
): Promise<{
  details: any;
  ok: boolean;
  data: T[] | null;
  pageDetails?: Omit<PaginatedResponse<T>, "results">;
}> {
  const result = await request<{
    results: T[];
    count: number;
    next: string | null;
    previous: string | null;
    currentPage: number;
    totalPages: number;
    ids: number[];
  }>(endpoint, { method: "GET", params: params });

  if (!result.ok || !result.data) return { ...result, data: null };

  const { results, ...pageDetails } = result.data;

  return { details: "", ok: true, data: results, pageDetails };
}

export async function postItemRequest<T>(endpoint: string, body: T) {
  return await request<T>(endpoint, {
    method: "POST",
    body: body,
  });
}

export async function updateItemRequest<T>(
  endpoint: string,
  itemId: number,
  body: T
) {
  return await request<T>(endpoint, {
    method: "PATCH",
    body: body,
    itemId: itemId,
  });
}

export async function deleteItemRequest(endpoint: string, itemId: number) {
  return await request(endpoint, {
    method: "DELETE",
    itemId: itemId,
  });
}
