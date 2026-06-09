import axios from "axios"

const API = `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/enquiries`

export const getEnquiries  = ()         => axios.get(API)
export const createEnquiry = (data)     => axios.post(API, data)
export const updateEnquiry = (id, data) => axios.put(`${API}/${id}`, data)
export const deleteEnquiry = (id)       => axios.delete(`${API}/${id}`)
export const getSheetUrl   = ()         => axios.get(`${API}/sheet-url`)