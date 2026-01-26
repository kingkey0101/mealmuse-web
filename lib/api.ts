import { getSession } from "next-auth/react";

export const API_BASE =
  "https://mh3m28rfq5.execute-api.us-east-2.amazonaws.com/prod";

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const session = await getSession();
  const token = session?.user?.token;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}