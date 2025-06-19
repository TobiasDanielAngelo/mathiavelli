import { getToken } from "./_apiHelpers";

export async function guidedRequest(
  endpoint: string,
  options: {
    method: "POST";
    body?: any;
    itemId?: number;
    params?: string;
  }
): Promise<string> {
  const token = getToken();

  let url = `${import.meta.env.VITE_BASE_URL}/${endpoint}`;

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
    return msg as string;
  }
  return "Good!";
}

export async function generateMissingEvents() {
  return await guidedRequest("generate-events", {
    method: "POST",
  });
}
