import { BrowserRouter, Routes, Route } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import AddClientForm from "./components/AddClientForm"
import EditClientForm from "./components/EditClientForm"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add-client" element={<AddClientForm />} />
        <Route path="/edit-client/:id" element={<EditClientForm />} />
      </Routes>
    </BrowserRouter>
  )
}