import { useState } from "react"
import { createEnquiry } from "../services/enquiryService"

export default function AddEnquiryModal({ onClose, refreshData }) {
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    companyName: "",
    bdMemberName: "",
    teamLeaderName: "",
    hrExecutiveName: "",
    emailId: "",
    mobileNo: "",
    positionName: "",
    placementFees: "",
    enquiryStatus: "In Progress",
    remarks: "",
  })

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
      await createEnquiry({
        company_name:    form.companyName,
        bd_member:       form.bdMemberName,
        team_leader:     form.teamLeaderName,
        hr_executive:    form.hrExecutiveName,
        email:           form.emailId,
        mobile:          form.mobileNo,
        position_name:   form.positionName,
        placement_fees:  form.placementFees,
        status:          form.enquiryStatus || "In Progress",
        remarks:         form.remarks || "",
      })

      refreshData()
      onClose()

    } catch (err) {
      alert("Failed: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Add Enquiry Data</h2>
            <p style={styles.subtitle}>Fill in the details below to add a new enquiry</p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {/* Form */}
        <div style={styles.body}>
          <div style={styles.row}>
            <Field label="Company Name *" name="companyName" value={form.companyName} onChange={handleChange} placeholder="Enter company name" />
            <Field label="Mobile No. *"   name="mobileNo"    value={form.mobileNo}    onChange={handleChange} placeholder="Enter mobile number" />
          </div>

          <div style={styles.row}>
            <Field label="BD Member"     name="bdMemberName"    value={form.bdMemberName}    onChange={handleChange} placeholder="BD member name" />
            <Field label="Team Leader"   name="teamLeaderName"  value={form.teamLeaderName}  onChange={handleChange} placeholder="Team leader name" />
          </div>

          <div style={styles.row}>
            <Field label="HR Executive"  name="hrExecutiveName" value={form.hrExecutiveName} onChange={handleChange} placeholder="HR executive name" />
            <Field label="Email"         name="emailId"         value={form.emailId}         onChange={handleChange} placeholder="Email address" type="email" />
          </div>

          <div style={styles.row}>
            <Field label="Designation"    name="positionName"  value={form.positionName}  onChange={handleChange} placeholder="Position / designation" />
            <Field label="Placement Fees" name="placementFees" value={form.placementFees} onChange={handleChange} placeholder="Amount" type="number" />
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Enquiry Status</label>
              <select name="enquiryStatus" value={form.enquiryStatus} onChange={handleChange} style={styles.input}>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
                <option value="Invoiced">Invoiced</option>
                <option value="On Hold">On Hold</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Remarks</label>
              <input
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                placeholder="Any remarks"
                style={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button onClick={onClose} style={cancelBtn}>Cancel</button>
          <button onClick={handleSubmit} style={submitBtn} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </div>

      </div>
    </div>
  )
}

/* Small reusable field */
function Field({ label, name, value, onChange, placeholder, type = "text" }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        style={styles.input}
      />
    </div>
  )
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    fontFamily: "'Segoe UI', sans-serif",
  },
  modal: {
    background: "#fff",
    border: "1px solid #E9D5FF",
    borderRadius: 12,
    width: 680,
    maxWidth: "95vw",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "20px 24px",
    borderBottom: "1px solid #E9D5FF",
  },
  title: {
    margin: "0 0 4px",
    fontSize: 20,
    fontWeight: 700,
    color: "#5B21B6",
  },
  subtitle: {
    margin: 0,
    fontSize: 13,
    color: "#6B7280",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: 18,
    color: "#9CA3AF",
    cursor: "pointer",
    padding: "0 4px",
    lineHeight: 1,
  },
  body: {
    padding: "20px 24px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  row: {
    display: "flex",
    gap: 16,
  },
  field: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: 500,
    color: "#6B7280",
  },
  input: {
    padding: "9px 12px",
    border: "1px solid #E9D5FF",
    borderRadius: 8,
    fontSize: 13,
    color: "#111827",
    outline: "none",
    background: "#FAFAFA",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    padding: "16px 24px",
    borderTop: "1px solid #E9D5FF",
  },
}

const cancelBtn = {
  background: "#fff",
  color: "#374151",
  border: "1px solid #D1D5DB",
  borderRadius: 8,
  padding: "9px 18px",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 500,
}

const submitBtn = {
  background: "#5B21B6",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "9px 18px",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
}
