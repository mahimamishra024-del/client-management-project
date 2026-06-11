import axios from "axios";

const API = "http://localhost:5000";

export const getEnquiries = () => {
  return axios.get(`${API}/api/enquiries`);
};

export const createEnquiry = (data) => {
  return axios.post(`${API}/api/enquiries`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const updateEnquiry = (id, data) => {
  return axios.put(`${API}/api/enquiries/${id}`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const deleteEnquiry = (id) => {
  return axios.delete(`${API}/api/enquiries/${id}`);
};

export const exportExcel = () => {
  return axios.get(`${API}/api/enquiries/export/excel`);
};