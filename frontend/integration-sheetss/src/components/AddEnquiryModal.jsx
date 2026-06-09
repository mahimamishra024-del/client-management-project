import { useState } from "react"
import { createEnquiry } from "../services/enquiryService"
import EnquiryFormFields from "./EnquiryFormFields"

const EMPTY = {
  companyName: "", bdMemberName: "", teamLeaderName: "", franchiseeName: "",
  nameOfFranchisee: "", hrExecutiveName: "", designation: "", gstNo: "",
  addressLine1: "", emailId: "", mobileNo: "", website: "", placementFees: "",
  positionName: "", from: "", to: "", creditPeriod: "", replacementPeriod: "",
  enquiryStatus: "inprogress", remarks: "", dateOfAllocation: "",
  dateOfReallocation: "", newTeamLeader: "", bill_no: "", bill_date: "",
  bill_amount: "", candidateName: "", additionalContacts: "",
}

export default function AddEnquiryModal({ onClose, refreshData }) {
  const [form, setForm]       = useState(EMPTY)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.companyName || !form.mobileNo) {
      alert("Company Name and Mobile are required!")
      return
    }
    setLoading(true)
    try {
      await createEnquiry(form)
      refreshData()
      onClose()
    } catch (err) {
      alert("Failed: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Add Enquiry" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <EnquiryFormFields form={form} onChange={setForm} />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24, paddingTop: 16, borderTop: "1px solid #E5E7EB" }}>
          <button type="button" onClick={onClose} style={cancelBtn}>Cancel</button>
          <button type="submit" disabled={loading} style={submitBtn}>{loading ? "Saving..." : "Save Enquiry"}</button>
        </div>
      </form>
    </Modal>
  )
}

export function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "40px 20px" }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 720, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 28px", borderBottom: "1px solid #E5E7EB" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1F2937" }}>Edit Enquiry</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#9CA3AF", lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ padding: "20px 28px 28px" }}>
          {children}
        </div>
      </div>
    </div>
  )
}

const submitBtn = { background: "#5B21B6", color: "#fff", border: "none", padding: "10px 28px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600 }
const cancelBtn = { background: "#F3F4F6", color: "#374151", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontSize: 14 }
