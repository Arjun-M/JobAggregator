"use client";

const ADMIN_TOKEN_KEY = "job-classifier-admin-token";
const USER_TOKEN_KEY = "job-classifier-user-token";
const USER_DATA_KEY = "job-classifier-user-data";

export function getAdminToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string) {
  window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function getUserToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(USER_TOKEN_KEY);
}

export function setUserToken(token: string) {
  window.localStorage.setItem(USER_TOKEN_KEY, token);
}

export function setUserData(data: { userId: string; username: string; role: string }) {
  window.localStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
}

export function getUserData(): { userId: string; username: string; role: string } | null {
  if (typeof window === "undefined") return null;
  const data = window.localStorage.getItem(USER_DATA_KEY);
  return data ? JSON.parse(data) : null;
}

export function clearUserSession() {
  window.localStorage.removeItem(USER_TOKEN_KEY);
  window.localStorage.removeItem(USER_DATA_KEY);
}

// For backward compatibility if needed, but we should use specific ones
export const getToken = getAdminToken;
export const setToken = setAdminToken;
export const clearToken = clearAdminToken;
