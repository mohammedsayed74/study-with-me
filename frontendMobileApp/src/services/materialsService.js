import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/api";

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getMaterials = async (courseCode) => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/api/materials/${courseCode}`, {
    headers,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch materials");
  return data.data || [];
};

export const getPendingMaterials = async (courseCode) => {
  const headers = await getAuthHeaders();
  const res = await fetch(
    `${API_BASE_URL}/api/materials/${courseCode}/pending`,
    { headers }
  );
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.message || "Failed to fetch pending materials");
  return data.data || [];
};

export const uploadMaterial = async (courseCode, title, fileUri, fileName) => {
  const token = await AsyncStorage.getItem("token");

  const formData = new FormData();
  formData.append("title", title);
  formData.append("courseCode", courseCode);
  formData.append("pdf", {
    uri: fileUri,
    name: fileName,
    type: "application/pdf",
  });

  const res = await fetch(
    `${API_BASE_URL}/api/materials/upload/${courseCode}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Upload failed");
  return data;
};

export const approveMaterial = async (materialId) => {
  const headers = await getAuthHeaders();
  const res = await fetch(
    `${API_BASE_URL}/api/materials/${materialId}/approve`,
    {
      method: "PATCH",
      headers,
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to approve material");
  return data;
};

export const deleteMaterial = async (materialId) => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/api/materials/${materialId}`, {
    method: "DELETE",
    headers,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete material");
  return data;
};
