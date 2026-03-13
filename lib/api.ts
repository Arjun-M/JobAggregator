export async function apiFetch<T>(path: string, init?: RequestInit, token?: string): Promise<T> {
  let url = path;

  if (!url.match(/^[a-zA-Z]+:\/\//)) {
    if (typeof window === "undefined") {
      const { loadEnv } = await import("@/lib/config");
      const env = loadEnv();
      url = `${env.NEXT_PUBLIC_API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
    } else if (!path.startsWith("/")) {
      url = `/${path}`;
    }
  }

  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const text = await response.text();
    let errorMessage = text || `Request failed with ${response.status}`;
    
    try {
      const json = JSON.parse(text);
      if (json.error) {
        errorMessage = json.error;
      }
    } catch (e) {
      // Not JSON, keep original text
    }
    
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}
