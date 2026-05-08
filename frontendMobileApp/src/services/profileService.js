import { API_BASE_URL } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getProfile(token) {
  const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch profile");
  }

  return data;
}

export async function uploadProfilePicture(imageUri, fileName, mimeType) {
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
}

export async function deleteProfilePicture() {
  const token = await AsyncStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/api/users/profile-picture`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete profile picture");
  }

  return data;
}
