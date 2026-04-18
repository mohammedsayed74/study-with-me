import { API_BASE_URL } from "../config/api";

const authHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export const getQuestions = async (courseCode, chapter, level, token) => {
  const chapterNumber = chapter.replace("chapter-", "");
  const res = await fetch(
    `${API_BASE_URL}/api/MCQs?courseCode=${courseCode}&chapter=${chapterNumber}&difficulty=${level}`,
    { headers: authHeaders(token) }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load questions");
  return data.data || [];
};

export const verifyAnswer = async (questionId, selectedOption, token) => {
  const res = await fetch(`${API_BASE_URL}/api/MCQs/verify`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ questionId, selectedOption }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to verify answer");
  return data;
};

export const addQuestion = async (payload, token) => {
  const res = await fetch(`${API_BASE_URL}/api/MCQs`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to add question");
  return data;
};

export const updateQuestion = async (id, payload, token) => {
  const res = await fetch(`${API_BASE_URL}/api/MCQs/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update question");
  return data;
};

export const deleteQuestion = async (id, token) => {
  const res = await fetch(`${API_BASE_URL}/api/MCQs/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete question");
  return data;
};
