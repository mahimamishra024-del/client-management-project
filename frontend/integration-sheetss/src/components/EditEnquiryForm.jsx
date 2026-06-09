import { useState } from "react"
import { updateEnquiry, deleteEnquiry } from "../services/enquiryService"

export default function EditEnquiryForm({ enquiry, refreshData, onClose }) {
  const [form, setForm]       = useState(enquiry)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

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
    if (!window.confirm("Delete this enquiry?")) return
    try {
      await deleteEnquiry(enquiry.id)
      refreshData()
      onClose()
    } catch (err) {
      alert("Delete failed: " + err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.grid}>
        <div>
          <label style={styles.label}>COMPANY NAME</label>
          <input name="companyName" value={form.companyName || ""}
            onChange={handleChange} style={styles.input} />
        </div>
        <div>
          <label style={styles.label}>EMAIL</label>
          <input name="emailId" value={form.emailId || ""}
            onChange={handleChange} style={styles.input} />
        </div>
        <div>
          <label style={styles.label}>MOBILE</label>
          <input name="mobileNo" value={form.mobileNo || ""}
            onChange={handleChange} style={styles.input} />
        </div>
        <div>
          <label style={styles.label}>STATUS</label>
          <select name="enquiryStatus" value={form.enquiryStatus || ""}
            onChange={handleChange} style={styles.input}>
            <option value="inprogress">In Progress</option>
            <option value="closed">Closed</option>
            <option value="offered_and_accepted">Offered & Accepted</option>
            <option value="offered_and_rejected">Offered & Rejected</option>
            <option value="position_hold">Position Hold</option>
            <option value="internally_closed">Internally Closed</option>
            <option value="invoiced">Invoiced</option>
            <option value="reallocation">Reallocation</option>
            <option value="revised">Revised</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label style={styles.label}>BILL AMOUNT</label>
          <input name="bill_amount" type="number" value={form.bill_amount || ""}
            onChange={handleChange} style={styles.input} />
        </div>
        <div>
          <label style={styles.label}>BILL NO</label>
          <input name="bill_no" value={form.bill_no || ""}
            onChange={handleChange} style={styles.input} />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={styles.label}>REMARKS</label>
          <textarea name="remarks" value={form.remarks || ""}
            onChange={handleChange} rows={2}
            style={{ ...styles.input, resize: "vertical" }} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button type="submit" disabled={loading} style={styles.saveBtn}>
          {loading ? "Saving..." : "Save"}
        </button>
        <button type="button" onClick={onClose} style={styles.cancelBtn}>
          Cancel
        </button>
        <button type="button" onClick={handleDelete} style={styles.deleteBtn}>
          Delete
        </button>
      </div>
    </form>
  )
}

const styles = {
  form: {
    padding: 16, background: "#F9FAFB",
    borderTop: "1px solid #E5E7EB",
  },
  grid: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: 12, marginBottom: 14,
  },
  label: {
    display: "block", fontSize: 11, fontWeight: 600,
    color: "#6B7280", marginBottom: 4,
  },
  input: {
    width: "100%", padding: "7px 10px",
    border: "1px solid #D1D5DB", borderRadius: 6,
    fontSize: 13, boxSizing: "border-box",
  },
  saveBtn: {
    background: "#5B21B6", color: "#fff", border: "none",
    padding: "8px 18px", borderRadius: 6,
    cursor: "pointer", fontSize: 13, fontWeight: 600,
  },
  cancelBtn: {
    background: "#F3F4F6", color: "#374151", border: "none",
    padding: "8px 18px", borderRadius: 6,
    cursor: "pointer", fontSize: 13,
  },
  deleteBtn: {
    background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA",
    padding: "8px 18px", borderRadius: 6,
    cursor: "pointer", fontSize: 13,
  },
}
