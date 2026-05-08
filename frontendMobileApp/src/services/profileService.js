import axios from "axios";
import { API_BASE_URL } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getProfile(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch profile");
  }
}

export async function uploadProfilePicture(imageUri, fileName, mimeType) {
  try {
    const token = await AsyncStorage.getItem("token");
    
    const formData = new FormData();
    formData.append("image", {
      uri: imageUri,
      name: fileName,
      type: mimeType || "image/jpeg",
    });

    const response = await axios.post(`${API_BASE_URL}/api/users/upload-profile-picture`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to upload profile picture");
  }
}

export async function deleteProfilePicture() {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.delete(`${API_BASE_URL}/api/users/profile-picture`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete profile picture");
  }
}
