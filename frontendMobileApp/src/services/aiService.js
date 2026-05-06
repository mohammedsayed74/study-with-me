import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/api";

export const getDocuments = async () => {
  const token = await AsyncStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/api/ai/documents`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch documents");
  return data;
};

export const uploadDocument = async (fileUri, fileName) => {
  const token = await AsyncStorage.getItem("token");
  
  const formData = new FormData();
  formData.append('pdf', {
    uri: fileUri,
    name: fileName,
    type: 'application/pdf',
  });
  formData.append('title', fileName);

  const res = await fetch(`${API_BASE_URL}/api/ai/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || "Failed to upload document");
  return data;
};

export const getDocumentDetails = async (documentId) => {
  const token = await AsyncStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/api/ai/documents/${documentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch document details");
  return data;
};

export const sendChatMessage = async (documentId, message) => {
  const token = await AsyncStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/api/ai/chat/${documentId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to send message");
  return data;
};
