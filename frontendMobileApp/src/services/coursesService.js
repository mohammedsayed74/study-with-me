import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/api";

export const getCourses = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/courses/allCourses`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
};

export const getCourse = async (courseCode) => {
  const res = await fetch(`${API_BASE_URL}/api/courses/${courseCode}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch course");
  return data.data;
};

export const createCourse = async (title, courseCode, description) => {
  const token = await AsyncStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/api/courses/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, courseCode, description }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create course");
  return data;
};

export const updateCourse = async (courseCode, title, description) => {
  const token = await AsyncStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/api/courses/${courseCode}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, description }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update course");
  return data;
};
