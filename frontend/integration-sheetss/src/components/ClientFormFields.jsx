const STATUS_OPTIONS = [
  { value: "inprogress",           label: "In Progress" },
  { value: "closed",               label: "Closed" },
  { value: "invoiced",             label: "Invoiced" },
  { value: "offered_and_accepted", label: "Offered & Accepted" },
  { value: "offered_and_rejected", label: "Offered & Rejected" },
  { value: "position_hold",        label: "Position Hold" },
  { value: "internally_closed",    label: "Internally Closed" },
  { value: "reallocation",         label: "Reallocation" },
  { value: "revised",              label: "Revised" },
  { value: "cancelled",            label: "Cancelled" },
  { value: "rejected",             label: "Rejected" },
]

// ── FIX: timezone-safe date formatter ──
// Using new Date().toString() shifts date by timezone offset (IST = +5:30)
// This extracts YYYY-MM-DD from any date string without timezone conversion
const toDateValue = (val) => {
  if (!val) return "";
  const str = String(val);
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  // ISO string — take only date part before T
  if (str.includes("T")) return str.split("T")[0];
  return str;
};

export default function EnquiryFormFields({ form, onChange }) {
  const set = (e) => onChange({ ...form, [e.target.name]: e.target.value })

  const isClosed       = form.enquiryStatus === "closed" || form.enquiryStatus === "invoiced"
  const isReallocation = form.enquiryStatus === "reallocation"

  return (
    <div>

      <SectionHead label="A. Company & Contact Details" />

      <Field label="Name of Franchisee *">
        <input name="franchiseeName" value={form.franchiseeName || ""} 
          onChange={e => onChange({ ...form, franchiseeName: e.target.value, nameOfFranchisee: e.target.value })} 
          style={inp} placeholder="e.g. Mumbai Franchise" />
      </Field>

      <Field label="Select Client *">
        <input name="companyName" value={form.companyName || ""} onChange={set} style={inp} placeholder="Company name..." required />
      </Field>

      <div style={grid3}>
        <Field label="Name of BD Member">
          <input name="bdMemberName" value={form.bdMemberName || ""} onChange={set} style={inp} />
        </Field>
        <Field label="Name of Team Leader">
          <input name="teamLeaderName" value={form.teamLeaderName || ""} onChange={set} style={inp} />
        </Field>
        <Field label="Company Name">
          <input value={form.companyName || ""} readOnly style={readonlyInp} />
        </Field>
      </div>

      <div style={grid3}>
        <Field label="Name of HR Executive">
          <input name="hrExecutiveName" value={form.hrExecutiveName || ""} onChange={set} style={inp} />
        </Field>
        <Field label="Designation">
          <input name="designation" value={form.designation || ""} onChange={set} style={inp} />
        </Field>
        <Field label="GST No.">
          <input name="gstNo" value={form.gstNo || ""} onChange={set} maxLength={15} style={inp} />
        </Field>
      </div>

      <Field label="Address Line 1">
        <input name="addressLine1" value={form.addressLine1 || ""} onChange={set} style={inp} />
      </Field>

      <div style={grid3}>
        <Field label="Email ID">
          <input name="emailId" type="email" value={form.emailId || ""} onChange={set} style={inp} />
        </Field>
        <Field label="Mobile Number">
          <div style={{ display: "flex" }}>
            <span style={{ padding: "9px 10px", border: "1px solid #D1D5DB", borderRight: "none", borderRadius: "6px 0 0 6px", background: "#F3F4F6", fontSize: 13, whiteSpace: "nowrap", color: "#374151" }}>
              🇮🇳 +91
            </span>
            <input
              name="mobileNo"
              value={(form.mobileNo || "").replace(/^\+?91\s?/, "")}
              onChange={e => onChange({ ...form, mobileNo: e.target.value })}
              style={{ ...inp, borderRadius: "0 6px 6px 0", flex: 1 }}
              placeholder="98765 43210"
            />
          </div>
        </Field>
        <Field label="Website">
          <input name="website" value={form.website || ""} onChange={set} style={inp} />
        </Field>
      </div>

      <div style={grid2}>
        <Field label="Candidate Name">
          <input name="candidateName" value={form.candidateName || ""} onChange={set} style={inp} />
        </Field>
        <Field label="Franchisee Name">
          <input name="franchiseeName" value={form.franchiseeName || ""} 
            onChange={e => onChange({ ...form, franchiseeName: e.target.value, nameOfFranchisee: e.target.value })} 
            style={inp} />
        </Field>
      </div>

      <Field label="Additional Contacts">
        <textarea name="additionalContacts" value={form.additionalContacts || ""} onChange={set} rows={2} style={{ ...inp, resize: "vertical" }} />
      </Field>

      <SectionHead label="B. HR Recruitment Details" />

      <div style={grid3}>
        <Field label="Placement Fees">
          <input name="placementFees" type="number" value={form.placementFees || ""} onChange={set} style={inp} />
        </Field>
        <Field label="Credit Period (days)">
          <input name="creditPeriod" type="number" value={form.creditPeriod || ""} onChange={set} style={inp} />
        </Field>
        <Field label="Replacement Period (days)">
          <input name="replacementPeriod" type="number" value={form.replacementPeriod || ""} onChange={set} style={inp} />
        </Field>
      </div>

      <div style={grid2}>
        <Field label="Position Name">
          <input name="positionName" value={form.positionName || ""} onChange={set} style={inp} />
        </Field>
        <Field label="Date of Allocation">
          <input name="dateOfAllocation" type="date"
            value={toDateValue(form.dateOfAllocation)}
            onChange={set} style={inp} />
        </Field>
      </div>

      <Field label="Salary Range">
        <div style={{ display: "flex", gap: 12 }}>
          <input name="from" type="number" value={form.from || ""} onChange={set} style={{ ...inp, flex: 1 }} placeholder="From" />
          <input name="to"   type="number" value={form.to   || ""} onChange={set} style={{ ...inp, flex: 1 }} placeholder="To" />
        </div>
      </Field>

      <Field label="Enquiry Status">
        <select name="enquiryStatus" value={form.enquiryStatus || "inprogress"} onChange={set} style={inp}>
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Field>

      <Field label="Remarks">
        <textarea name="remarks" value={form.remarks || ""} onChange={set} rows={3} style={{ ...inp, resize: "vertical" }} />
      </Field>

      {isReallocation && (
        <div style={grid2}>
          <Field label="Date of Reallocation">
            <input name="dateOfReallocation" type="date"
              value={toDateValue(form.dateOfReallocation)}
              onChange={set} style={inp} />
          </Field>
          <Field label="New Team Leader">
            <input name="newTeamLeader" value={form.newTeamLeader || ""} onChange={set} style={inp} />
          </Field>
        </div>
      )}

      {isClosed && (
        <>
          <SectionHead label="C. Billing Details" />
          <div style={grid3}>
            <Field label="Bill No">
              <input name="bill_no" value={form.bill_no || ""} onChange={set} style={inp} />
            </Field>
            <Field label="Bill Date">
              <input name="bill_date" type="date"
                value={toDateValue(form.bill_date)}
                onChange={set} style={inp} />
            </Field>
            <Field label="Bill Amount">
              <input name="bill_amount" type="number" value={form.bill_amount || ""} onChange={set} style={inp} />
            </Field>
          </div>
        </>
      )}

    </div>
  )
}

function SectionHead({ label }) {
  return (
    <h3 style={{ margin: "24px 0 14px", fontSize: 15, fontWeight: 700, color: "#1F2937", borderBottom: "2px solid #EDE9FE", paddingBottom: 8 }}>
      {label}
    </h3>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 5 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inp = {
  width: "100%",
  padding: "9px 12px",
  border: "1px solid #D1D5DB",
  borderRadius: 6,
  fontSize: 13,
  boxSizing: "border-box",
  outline: "none",
  background: "#fff",
  color: "#1F2937",
}

const readonlyInp = {
  ...inp,
  background: "#F3F4F6",
  color: "#6B7280",
  cursor: "not-allowed",
}

const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }
const grid3 = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }
