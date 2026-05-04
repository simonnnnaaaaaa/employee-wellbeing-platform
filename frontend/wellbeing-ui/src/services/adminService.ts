import axios from "axios";

const API_URL = "https://localhost:7258/api/admin";

export async function getUsers() {
  const token = localStorage.getItem("token");

  const response = await axios.get(`${API_URL}/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function updateUserRole(id: string, role: string) {
  const token = localStorage.getItem("token");

  await axios.put(
    `${API_URL}/users/${id}/role`,
    { role },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export async function updateUserDepartment(id: string, department: string) {
  const token = localStorage.getItem("token");

  await axios.put(
    `${API_URL}/users/${id}/department`,
    { department },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}