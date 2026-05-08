import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/api";

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const rateMaterial = async (materialId, score) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.patch(
      `${API_BASE_URL}/api/materials/${materialId}/rate`,
      { score },
      { headers }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to rate material");
  }
};

export const getMaterials = async (courseCode) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/api/materials/${courseCode}`, {
      headers,
    });
    return response.data.data || [];
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch materials");
  }
};

export const getPendingMaterials = async (courseCode) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/api/materials/${courseCode}/pending`, {
      headers,
    });
    return response.data.data || [];
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch pending materials");
  }
};

export const uploadMaterial = async (courseCode, title, fileUri, fileName) => {
  try {
    const token = await AsyncStorage.getItem("token");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("courseCode", courseCode);
    formData.append("pdf", {
      uri: fileUri,
      name: fileName,
      type: "application/pdf",
    });

    const response = await axios.post(
      `${API_BASE_URL}/api/materials/upload/${courseCode}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Upload failed");
  }
};

export const approveMaterial = async (materialId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.patch(
      `${API_BASE_URL}/api/materials/${materialId}/approve`,
      {},
      { headers }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to approve material");
  }
};

export const deleteMaterial = async (materialId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.delete(`${API_BASE_URL}/api/materials/${materialId}`, {
      headers,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete material");
  }
};

export const toggleFavoriteMaterial = async (materialId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${API_BASE_URL}/api/users/toggle-favorite-material`,
      { materialId },
      { headers }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to toggle favorite");
  }
};

export const getFavoriteMaterials = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/api/users/favorite-materials`, {
      headers,
    });
    return response.data.data || [];
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch favorite materials");
  }
};
