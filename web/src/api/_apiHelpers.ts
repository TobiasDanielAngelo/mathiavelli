import { PaginatedResponse } from "../constants/interfaces";

export function autoFormData(body: Record<string, any>) {
  let needsFormData = false;
  const fileExtensionRegex = /\.(jpg|jpeg|png|gif|pdf|docx?|xlsx?|txt)$/i;

  for (const value of Object.values(body)) {
    if (value instanceof File || value instanceof Blob) {
      needsFormData = true;
      break;
    }
  }

  if (!needsFormData) {
    // strip keys with file-like strings even in JSON
    const filtered: Record<string, any> = {};
    for (const key in body) {
      if (
        !(typeof body[key] === "string" && fileExtensionRegex.test(body[key]))
      ) {
        filtered[key] = body[key];
      }
    }
    return filtered;
  }

  // Build FormData, skip existing file links
  const formData = new FormData();
  for (const key in body) {
    const value = body[key];
    if (typeof value === "string" && fileExtensionRegex.test(value)) {
      continue;
    }
    formData.append(key, value);
  }

  return formData;
}

export function getCookie(name: string): string {
  const cookies = document.cookie ? document.cookie.split(";") : [];
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(name + "=")) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return "";
}

export const fetchCSRF = async () => {
  return await guidedRequest("csrf/", {
    method: "GET",
  });
};

export async function guidedRequest<T>(
  endpoint: string,
  options: {
    method: "GET" | "POST" | "PATCH" | "DELETE";
    body?: any;
    itemId?: number | string;
    params?: string;
  }
): Promise<{ details: any; ok: boolean; data: T | null }> {
  const input = new URLSearchParams(options.params);
  const filtered = new URLSearchParams();

  for (const [key, value] of input.entries()) {
    if (value.trim()) filtered.append(key, value);
  }

  let url = `${import.meta.env.VITE_BASE_URL}/${endpoint}`;
  if (options.itemId) url += `${options.itemId}/`;
  if (options.params) url += `?${filtered.toString()}`;

  const preparedBody = options.body ? autoFormData(options.body) : undefined;
  const isFormData = preparedBody instanceof FormData;

  const headers: Record<string, string> = {
    "ngrok-skip-browser-warning": "any",
    "X-CSRFToken": getCookie("csrftoken"),
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    method: options.method,
    credentials: "include",
    body: preparedBody
      ? isFormData
        ? preparedBody
        : JSON.stringify(preparedBody)
      : undefined,
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
  const result = await guidedRequest<{
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

export async function postItemRequest<T>(endpoint: string, body?: T) {
  return await guidedRequest<T>(endpoint, {
    method: "POST",
    body: body,
  });
}

export async function updateItemRequest<T>(
  endpoint: string,
  itemId: number | string,
  body: T
) {
  return await guidedRequest<T>(endpoint, {
    method: "PATCH",
    body: body,
    itemId: itemId,
  });
}

export async function deleteItemRequest(
  endpoint: string,
  itemId: number | string
) {
  return await guidedRequest(endpoint, {
    method: "DELETE",
    itemId: itemId,
  });
}
