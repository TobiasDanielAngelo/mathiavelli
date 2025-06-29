import { getCookie } from "./_apiHelpers";

export async function guidedRequest(
  endpoint: string,
  options: {
    method: "POST";
    body?: any;
    itemId?: number;
    params?: string;
  }
): Promise<string> {
  let url = `${import.meta.env.VITE_BASE_URL}/${endpoint}`;

  const headers: Record<string, string> = {
    "Content-type": "application/json",
    "ngrok-skip-browser-warning": "any",
    credentials: "include",
    "X-CSRFToken": getCookie("csrftoken"),
  };

  const response = await fetch(url, {
    method: options.method,
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers,
  });

  if (!response.ok) {
    const msg = await response.json();
    return msg as string;
  }
  return "Good!";
}

export async function generateMissingEvents() {
  return await guidedRequest("generate-events", {
    method: "POST",
  });
}
