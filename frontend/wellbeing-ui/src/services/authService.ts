import axios from "axios";

const API_URL = "https://localhost:7258/api/auth"; // portul backend-ului tău

export async function login(email: string, password: string) {
  const response = await axios.post(`${API_URL}/login`, {
    email,
    password,
  });

  return response.data;
}

export async function register(
  firstName: string,
  lastName: string,
  email: string,
  password: string
) {
  const response = await axios.post(`${API_URL}/register`, {
    firstName,
    lastName,
    email,
    password,
  });

  return response.data;
}