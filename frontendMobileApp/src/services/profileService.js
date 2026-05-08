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

    const response = await fetch(`${API_BASE_URL}/api/users/upload-profile-picture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to upload profile picture");
    }

    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to upload profile picture");
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
