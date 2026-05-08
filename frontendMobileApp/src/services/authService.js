import axios from "axios";
import { API_BASE_URL } from "../config/api";

export async function registerUser(userData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/users/signUp`, userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.response?.data?.meesage || "Registration failed");
  }
}

export async function loginUser(userData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/users/login`, userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || "Login failed");
  }
}
