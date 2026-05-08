import axios from "axios";
import { API_BASE_URL } from "../config/api";

const authHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export const getQuestions = async (courseCode, chapter, level, token) => {
  try {
    const chapterNumber = chapter.replace("chapter-", "");
    const response = await axios.get(
      `${API_BASE_URL}/api/MCQs?courseCode=${courseCode}&chapter=${chapterNumber}&difficulty=${level}`,
      { headers: authHeaders(token) }
    );
    return response.data.data || [];
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to load questions");
  }
};

export const verifyAnswer = async (questionId, selectedOption, token) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/MCQs/verify`,
      { questionId, selectedOption },
      { headers: authHeaders(token) }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to verify answer");
  }
};

export const addQuestion = async (payload, token) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/MCQs`, payload, {
      headers: authHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to add question");
  }
};

export const updateQuestion = async (id, payload, token) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/api/MCQs/${id}`, payload, {
      headers: authHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update question");
  }
};

export const deleteQuestion = async (id, token) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/MCQs/${id}`, {
      headers: authHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete question");
  }
};
