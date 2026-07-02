import axios from "axios";

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"; // ✅ FIXED: was hardcoded

export const getClients = () => {
  return axios.get(`${API}/api/clients`);
};

export const createClient = (data) => {
  return axios.post(`${API}/api/clients`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const updateClient = (id, data) => {
  return axios.put(`${API}/api/clients/${id}`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const deleteClient = (id) => {
  return axios.delete(`${API}/api/clients/${id}`);
};

export const exportExcel = () => {
  return axios.get(`${API}/api/clients/export/excel`);
};