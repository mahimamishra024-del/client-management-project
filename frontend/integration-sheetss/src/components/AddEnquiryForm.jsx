import { useState } from "react"
import { createEnquiry } from "../services/enquiryService"

const EMPTY = {
  companyName: "",
  franchiseeName: "",
  bdMemberName: "",
  teamLeaderName: "",
  hrExecutiveName: "",
  designation: "",
  emailId: "",
  mobileNo: "",
  gstNo: "",
  addressLine1: "",
  positionName: "",
  placementFees: "",
  enquiryStatus: "inprogress",
  bill_no: "",
  bill_date: "",
  bill_amount: "",
  remarks: "",
}

export default function AddEnquiryForm({ refreshData }) {
  const [form, setForm]       = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [open, setOpen]       = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.companyName || !form.mobileNo) {
      alert("Company Name and Mobile are required!")
      return
    }
    setLoading(true)
    try {
      await createEnquiry(form)
      setForm(EMPTY)
      setOpen(false)
      refreshData()
    } catch (err) {
      alert("Failed to add enquiry: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const isClosed = form.enquiryStatus === "closed" || form.enquiryStatus === "invoiced"

  return (
    <div style={{ marginBottom: 20 }}>
      <button
        onClick={() => setOpen(!open)}
        style={styles.addBtn}
      >
        {open ? "✕ Cancel" : "+ Add Enquiry"}
      </button>

      {open && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h3 style={{ margin: "0 0 16px", color: "#374151" }}>New Enquiry</h3>

          <div style={styles.grid}>
            <div style={styles.field}>
              <label style={styles.label}>COMPANY NAME *</label>
              <input name="companyName" value={form.companyName}
                onChange={handleChange} placeholder="e.g. ABC Pvt Ltd"
                style={styles.input} required />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>FRANCHISEE NAME</label>
              <input name="franchiseeName" value={form.franchiseeName}
                onChange={handleChange} placeholder="e.g. Raj Enterprises"
                style={styles.input} />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>BD MEMBER</label>
              <input name="bdMemberName" value={form.bdMemberName}
                onChange={handleChange} style={styles.input} />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>TEAM LEADER</label>
              <input name="teamLeaderName" value={form.teamLeaderName}
                onChange={handleChange} style={styles.input} />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>HR EXECUTIVE</label>
              <input name="hrExecutiveName" value={form.hrExecutiveName}
                onChange={handleChange} style={styles.input} />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>DESIGNATION</label>
              <input name="designation" value={form.designation}
                onChange={handleChange} style={styles.input} />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>EMAIL</label>
              <input name="emailId" type="email" value={form.emailId}
                onChange={handleChange} style={styles.input} />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>MOBILE *</label>
              <input name="mobileNo" value={form.mobileNo}
                onChange={handleChange} style={styles.input} required />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>GST NO</label>
              <input name="gstNo" value={form.gstNo}
                onChange={handleChange} maxLength={15} style={styles.input} />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>POSITION</label>
              <input name="positionName" value={form.positionName}
                onChange={handleChange} style={styles.input} />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>STATUS</label>
              <select name="enquiryStatus" value={form.enquiryStatus}
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

            <div style={{ ...styles.field, gridColumn: "1 / -1" }}>
              <label style={styles.label}>ADDRESS</label>
              <input name="addressLine1" value={form.addressLine1}
                onChange={handleChange} style={styles.input} />
            </div>

            <div style={{ ...styles.field, gridColumn: "1 / -1" }}>
              <label style={styles.label}>REMARKS</label>
              <textarea name="remarks" value={form.remarks}
                onChange={handleChange} rows={2}
                style={{ ...styles.input, resize: "vertical" }} />
            </div>

            {isClosed && (
              <>
                <div style={styles.field}>
                  <label style={styles.label}>BILL NO</label>
                  <input name="bill_no" value={form.bill_no}
                    onChange={handleChange} style={styles.input} />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>BILL DATE</label>
                  <input name="bill_date" type="date" value={form.bill_date}
                    onChange={handleChange} style={styles.input} />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>BILL AMOUNT</label>
                  <input name="bill_amount" type="number" value={form.bill_amount}
                    onChange={handleChange} style={styles.input} />
                </div>
              </>
            )}
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? "Saving..." : "Save Enquiry"}
          </button>
        </form>
      )}
    </div>
  )
}

const styles = {
  addBtn: {
    background: "#5B21B6", color: "#fff", border: "none",
    padding: "10px 20px", borderRadius: 8, cursor: "pointer",
    fontSize: 14, fontWeight: 600,
  },
  form: {
    marginTop: 12, padding: 20,
    border: "1px solid #E5E7EB", borderRadius: 12,
    background: "#fff",
  },
  grid: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: 14, marginBottom: 16,
  },
  field: { display: "flex", flexDirection: "column" },
  label: {
    fontSize: 11, fontWeight: 600, color: "#6B7280",
    marginBottom: 5, letterSpacing: "0.05em",
  },
  input: {
    padding: "8px 10px", border: "1px solid #D1D5DB",
    borderRadius: 6, fontSize: 13, outline: "none",
    boxSizing: "border-box", width: "100%",
  },
  submitBtn: {
    background: "#5B21B6", color: "#fff", border: "none",
    padding: "10px 24px", borderRadius: 8,
    cursor: "pointer", fontSize: 14, fontWeight: 600,
  },
}
