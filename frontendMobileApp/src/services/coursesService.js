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
  try {
    const response = await axios.get(`${API_BASE_URL}/api/courses/${courseCode}`);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch course");
  }
};

export const createCourse = async (title, courseCode, description, department, year) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.post(
      `${API_BASE_URL}/api/courses`,
      { title, courseCode, description, department, year },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create course");
  }
};

export const updateCourse = async (courseCode, title, description) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.put(
      `${API_BASE_URL}/api/courses/${courseCode}`,
      { title, description },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update course");
  }
};

export const deleteCourse = async (courseCode) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.delete(
      `${API_BASE_URL}/api/courses/${courseCode}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete course");
  }
};

export const toggleFollowCourse = async (courseCode) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.post(
      `${API_BASE_URL}/api/users/toggle-follow`,
      { courseCode },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to toggle follow");
  }
};

