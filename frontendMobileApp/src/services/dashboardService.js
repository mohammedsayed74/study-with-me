import { API_BASE_URL } from "../config/api";

const authHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});


export async function getStudentRatings(token) {
  const res = await fetch(`${API_BASE_URL}/api/dashboard/student/my-ratings`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  return data.data || [];
}

export async function getStudentUploads(token) {
  const res = await fetch(`${API_BASE_URL}/api/dashboard/student/my-uploads`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  return data.data || [];
}


export async function getDoctorTopRated(token) {
  const res = await fetch(`${API_BASE_URL}/api/dashboard/doctor/top-rated`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  return data.data || [];
}

export async function getDoctorContributors(token) {
  const res = await fetch(`${API_BASE_URL}/api/dashboard/doctor/top-contributors`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  return data.data || [];
}

export async function getDoctorPending(token) {
  const res = await fetch(`${API_BASE_URL}/api/dashboard/doctor/pending`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  return data.data || [];
}


export async function approveMaterial(id, token) {
  const res = await fetch(`${API_BASE_URL}/api/materials/${id}/approve`, {
    method: "PATCH",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Failed to approve");
  }
}

export async function rejectMaterial(id, reason, note, token) {
  const res = await fetch(`${API_BASE_URL}/api/dashboard/doctor/reject/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ rejectionReason: reason, rejectionNote: note }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Failed to reject");
  }
}
