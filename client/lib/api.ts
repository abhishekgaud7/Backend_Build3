export const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: HeadersInit = {
    "content-type": "application/json",
    ...(options.headers || {}),
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

export async function apiFetchWithAuth<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const authHeaders: HeadersInit = {
    Authorization: `Bearer ${token}`,
  };
  return apiFetch<T>(path, { ...options, headers: { ...(options.headers || {}), ...authHeaders } });
}

