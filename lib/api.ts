import { getSession } from "next-auth/react";

const DEFAULT_API_BASE = "https://mh3m28rfq5.execute-api.us-east-2.amazonaws.com/prod";
const CLIENT_API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";
const SERVER_API_BASE =
  process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE || DEFAULT_API_BASE;

export const API_BASE = typeof window === "undefined" ? SERVER_API_BASE : CLIENT_API_BASE;

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
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
