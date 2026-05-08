import axios from "axios";
import { API_BASE_URL } from "../config/api";

const authHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});


export async function getStudentRatings(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/dashboard/student/my-ratings`, {
      headers: authHeaders(token),
    });
    return response.data.data || [];
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch student ratings");
  }
}

export async function getStudentUploads(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/dashboard/student/my-uploads`, {
      headers: authHeaders(token),
    });
    return response.data.data || [];
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch student uploads");
  }
}


export async function getDoctorTopRated(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/dashboard/doctor/top-rated`, {
      headers: authHeaders(token),
    });
    return response.data.data || [];
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch doctor top rated");
  }
}

export async function getDoctorContributors(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/dashboard/doctor/top-contributors`, {
      headers: authHeaders(token),
    });
    return response.data.data || [];
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch doctor contributors");
  }
}

export async function getDoctorPending(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/dashboard/doctor/pending`, {
      headers: authHeaders(token),
    });
    return response.data.data || [];
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch doctor pending");
  }
}


export async function approveMaterial(id, token) {
  try {
    const response = await axios.patch(`${API_BASE_URL}/api/materials/${id}/approve`, {}, {
      headers: authHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to approve");
  }
}

export async function rejectMaterial(id, reason, note, token) {
  try {
    const response = await axios.patch(`${API_BASE_URL}/api/dashboard/doctor/reject/${id}`, 
      { rejectionReason: reason, rejectionNote: note },
      { headers: authHeaders(token) }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to reject");
  }
}
