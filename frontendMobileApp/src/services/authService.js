import { API_BASE_URL } from "../config/api";

export async function registerUser(userData) {
  const response = await fetch(`${API_BASE_URL}/api/users/signUp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.meesage || "Registration failed");
  }

  return data;
}

export async function loginUser(userData) {
  const response = await fetch(`${API_BASE_URL}/api/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || "Login failed");
  }

  return data;
}
