import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/api";

export const getDocuments = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.get(`${API_BASE_URL}/api/ai/documents`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch documents");
  }
};

export const uploadDocument = async (fileUri, fileName) => {
  try {
    const token = await AsyncStorage.getItem("token");
    
    const formData = new FormData();
    formData.append('pdf', {
      uri: fileUri,
      name: fileName,
      type: 'application/pdf',
    });
    formData.append('title', fileName);

    const response = await fetch(`${API_BASE_URL}/api/ai/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.message || "Failed to upload document");
    }

    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to upload document");
  }
};

export const getDocumentDetails = async (documentId) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.get(`${API_BASE_URL}/api/ai/documents/${documentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch document details");
  }
};

export const sendChatMessage = async (documentId, message) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.post(
      `${API_BASE_URL}/api/ai/chat/${documentId}`,
      { message },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to send message");
  }
};
