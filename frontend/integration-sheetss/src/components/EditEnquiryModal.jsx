import { useState } from "react"
import { updateEnquiry, deleteEnquiry } from "../services/enquiryService"
import EnquiryFormFields from "./EnquiryFormFields"

export default function EditEnquiryModal({ enquiry, onClose, refreshData }) {
  const [form, setForm]       = useState({ ...enquiry })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateEnquiry(enquiry.id, form)
      refreshData()
      onClose()
    } catch (err) {
      alert("Update failed: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete enquiry for "${enquiry.companyName}"?`)) return
    try {
      await deleteEnquiry(enquiry.id)
      refreshData()
      onClose()
    } catch (err) {
      alert("Delete failed: " + err.message)
    }
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:1000, display:"flex", alignItems:"flex-start", justifyContent:"center", overflowY:"auto", padding:"40px 20px" }}>
      <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:720, boxShadow:"0 20px 60px rgba(0,0,0,0.18)" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 28px", borderBottom:"1px solid #E5E7EB" }}>
          <div>
            <button onClick={onClose} style={{ background:"none", border:"none", color:"#5B21B6", fontSize:13, cursor:"pointer", padding:0, fontWeight:500, marginBottom:4, display:"block" }}>
              ← Back to Enquiry Data
            </button>
            <h2 style={{ margin:0, fontSize:18, fontWeight:700, color:"#1F2937" }}>Edit Enquiry</h2>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#9CA3AF" }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding:"20px 28px 28px", maxHeight:"75vh", overflowY:"auto" }}>
          <form onSubmit={handleSubmit}>
            <EnquiryFormFields form={form} onChange={setForm} />

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:24, paddingTop:16, borderTop:"1px solid #E5E7EB" }}>
              <button type="button" onClick={handleDelete} style={deleteBtn}>
                🗑 Delete Enquiry
              </button>
              <div style={{ display:"flex", gap:12 }}>
                <button type="button" onClick={onClose} style={cancelBtn}>Cancel</button>
                <button type="submit" disabled={loading} style={updateBtn}>
                  {loading ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </form>
        </div>

      </div>
    </div>
  )
}

const updateBtn = { background:"#5B21B6", color:"#fff", border:"none", padding:"10px 28px", borderRadius:8, cursor:"pointer", fontSize:14, fontWeight:600 }
const cancelBtn = { background:"#F3F4F6", color:"#374151", border:"none", padding:"10px 20px", borderRadius:8, cursor:"pointer", fontSize:14 }
const deleteBtn = { background:"#FEF2F2", color:"#DC2626", border:"1px solid #FECACA", padding:"10px 18px", borderRadius:8, cursor:"pointer", fontSize:13 }
