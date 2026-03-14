import axios from "axios";
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